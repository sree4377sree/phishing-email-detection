"""
Email Security & Lexical Feature Extractor.
Extracts cybersecurity indicators from email headers, body text, and embedded URLs.
"""
import re
from urllib.parse import urlparse
import numpy as np

# Urgency and threat indicator phrases
URGENCY_KEYWORDS = [
    r"\burgen(t|cy)\b",
    r"\bimmediate(ly)?\b",
    r"\baction required\b",
    r"\baccount (suspended|locked|disabled|compromised|terminated)\b",
    r"\bwithin 24 hours?\b",
    r"\bverify your (account|identity|email|details)\b",
    r"\bunauthorized (access|activity|transaction)\b",
    r"\bsecurity alert\b",
    r"\bfinal notice\b",
    r"\bact now\b",
    r"\blimited time\b",
    r"\bthreatened\b",
    r"\bpenalty\b",
    r"\bsuspended\b",
]

# Sensitive credentials & financial keywords
CREDENTIAL_FINANCIAL_KEYWORDS = [
    r"\bpassword\b",
    r"\bpasscode\b",
    r"\bpin\b",
    r"\bcredit card\b",
    r"\bcvv\b",
    r"\bssn\b",
    r"\bsocial security\b",
    r"\bbank account\b",
    r"\brouting number\b",
    r"\bbilling update\b",
    r"\bwire transfer\b",
    r"\bcrypto(currency)?\b",
    r"\bbitcoin\b",
    r"\bwallet address\b",
    r"\binvoice attached\b",
    r"\breceipt\b",
]

# URL Shorteners often abused in phishing campaigns
SUSPICIOUS_SHORTENERS = {
    "bit.ly", "tinyurl.com", "goo.gl", "ow.ly", "is.gd", "buff.ly",
    "t.co", "cutt.ly", "shorturl.at", "tiny.cc", "rb.gy", "rebrand.ly"
}

# High-risk TLDs commonly seen in phishing
HIGH_RISK_TLDS = {
    ".xyz", ".top", ".tk", ".ml", ".ga", ".cf", ".gq", ".buzz",
    ".work", ".click", ".fit", ".country", ".kim", ".loan", ".racing"
}

# Well-known brands frequently targeted by brand impersonation
POPULAR_BRANDS = [
    "paypal", "apple", "google", "microsoft", "amazon", "netflix",
    "facebook", "instagram", "bank of america", "chase", "wells fargo",
    "citibank", "dhl", "fedex", "ups", "irs", "dropbox", "docu sign", "docusign"
]

URL_REGEX = re.compile(
    r'(?:https?:\/\/|www\.)[^\s<>"]+',
    re.IGNORECASE
)

IP_URL_REGEX = re.compile(
    r'https?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/[^\s]*)?',
    re.IGNORECASE
)


def extract_urls(text: str) -> list:
    """Find all URLs in the provided text."""
    if not text or not isinstance(text, str):
        return []
    return URL_REGEX.findall(text)


def analyze_urls(urls: list) -> dict:
    """
    Extract security signals from a list of URLs.
    """
    url_count = len(urls)
    ip_url_count = 0
    shortened_url_count = 0
    high_risk_tld_count = 0
    at_symbol_count = 0
    max_subdomain_depth = 0

    for raw_url in urls:
        # Prepend scheme if missing
        url_to_parse = raw_url if raw_url.startswith(("http://", "https://")) else "http://" + raw_url

        if IP_URL_REGEX.match(raw_url):
            ip_url_count += 1

        if "@" in raw_url:
            at_symbol_count += 1

        try:
            parsed = urlparse(url_to_parse)
            hostname = (parsed.hostname or "").lower()

            if hostname in SUSPICIOUS_SHORTENERS:
                shortened_url_count += 1

            for tld in HIGH_RISK_TLDS:
                if hostname.endswith(tld):
                    high_risk_tld_count += 1
                    break

            parts = hostname.split(".")
            if len(parts) > 2:
                max_subdomain_depth = max(max_subdomain_depth, len(parts) - 2)
        except Exception:
            continue

    return {
        "url_count": url_count,
        "ip_url_count": ip_url_count,
        "shortened_url_count": shortened_url_count,
        "high_risk_tld_count": high_risk_tld_count,
        "at_symbol_count": at_symbol_count,
        "max_subdomain_depth": max_subdomain_depth,
        "has_urls": int(url_count > 0),
        "has_ip_url": int(ip_url_count > 0),
        "has_suspicious_url": int(shortened_url_count > 0 or high_risk_tld_count > 0 or at_symbol_count > 0),
    }


def analyze_header_spoofing(sender: str, subject: str = "") -> dict:
    """
    Check if sender header exhibits brand impersonation / spoofing signals.
    e.g. Sender Name: "PayPal Support <service@randomdomain.xyz>"
    """
    sender = str(sender or "").lower()
    subject = str(subject or "").lower()

    # Extract email domain if present in angle brackets or plain string
    email_match = re.search(r'<([^>]+)>', sender)
    email_address = email_match.group(1) if email_match else sender
    domain_match = re.search(r'@([a-z0-9.\-]+)', email_address)
    sender_domain = domain_match.group(1) if domain_match else ""

    brand_mentioned = None
    is_spoofed_brand = False

    for brand in POPULAR_BRANDS:
        # Brand appears in display name or subject
        if brand in sender or brand in subject:
            brand_mentioned = brand
            # If brand is in sender or subject, verify if official domain matches
            if sender_domain and not (brand in sender_domain):
                is_spoofed_brand = True
            break

    # Free webmail used for corporate/banking claims
    free_domains = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"}
    free_webmail_impersonation = False
    if brand_mentioned and sender_domain in free_domains:
        free_webmail_impersonation = True

    return {
        "brand_mentioned": brand_mentioned or "",
        "is_spoofed_brand": int(is_spoofed_brand),
        "free_webmail_impersonation": int(free_webmail_impersonation),
        "sender_domain": sender_domain,
    }


def extract_linguistic_features(text: str) -> dict:
    """
    Extract linguistic, emotional, and formatting cues from email body/subject.
    """
    text = str(text or "")
    text_len = len(text)
    words = text.split()
    word_count = len(words)

    if word_count == 0:
        return {
            "urgency_count": 0,
            "credential_count": 0,
            "uppercase_ratio": 0.0,
            "exclamation_ratio": 0.0,
            "question_ratio": 0.0,
            "word_count": 0,
            "char_count": 0,
        }

    # Count urgency matches
    text_lower = text.lower()
    urgency_count = sum(1 for pattern in URGENCY_KEYWORDS if re.search(pattern, text_lower))
    credential_count = sum(1 for pattern in CREDENTIAL_FINANCIAL_KEYWORDS if re.search(pattern, text_lower))

    # Formatting signals: shouting (all caps) & excessive punctuation
    alpha_chars = [c for c in text if c.isalpha()]
    uppercase_chars = [c for c in alpha_chars if c.isupper()]
    uppercase_ratio = len(uppercase_chars) / max(len(alpha_chars), 1)

    exclamation_count = text.count("!")
    question_count = text.count("?")

    return {
        "urgency_count": urgency_count,
        "credential_count": credential_count,
        "uppercase_ratio": round(uppercase_ratio, 4),
        "exclamation_ratio": round(exclamation_count / max(word_count, 1), 4),
        "question_ratio": round(question_count / max(word_count, 1), 4),
        "word_count": word_count,
        "char_count": text_len,
    }


def extract_full_feature_vector(sender: str = "", receiver: str = "", subject: str = "", body: str = "") -> dict:
    """
    Combine all security features into a structured dict suitable for inference
    and downstream ensemble features.
    """
    combined_text = f"{subject} {body}".strip()
    urls = extract_urls(combined_text)
    url_feats = analyze_urls(urls)
    header_feats = analyze_header_spoofing(sender, subject)
    ling_feats = extract_linguistic_features(combined_text)

    # Compute a quick heuristic threat score (0 to 100)
    heuristic_score = 0
    if url_feats["has_ip_url"]:
        heuristic_score += 35
    if url_feats["has_suspicious_url"]:
        heuristic_score += 25
    if url_feats["url_count"] > 3:
        heuristic_score += 15
    if header_feats["is_spoofed_brand"]:
        heuristic_score += 35
    if header_feats["free_webmail_impersonation"]:
        heuristic_score += 30
    if ling_feats["urgency_count"] >= 2:
        heuristic_score += 25
    elif ling_feats["urgency_count"] == 1:
        heuristic_score += 15
    if ling_feats["credential_count"] >= 2:
        heuristic_score += 25
    elif ling_feats["credential_count"] == 1:
        heuristic_score += 15
    if ling_feats["uppercase_ratio"] > 0.25:
        heuristic_score += 10

    heuristic_score = min(heuristic_score, 100)

    return {
        "urls": urls,
        "url_features": url_feats,
        "header_features": header_feats,
        "linguistic_features": ling_feats,
        "heuristic_score": heuristic_score,
        "feature_vector": [
            url_feats["url_count"],
            url_feats["has_ip_url"],
            url_feats["has_suspicious_url"],
            url_feats["shortened_url_count"],
            url_feats["high_risk_tld_count"],
            header_feats["is_spoofed_brand"],
            header_feats["free_webmail_impersonation"],
            ling_feats["urgency_count"],
            ling_feats["credential_count"],
            ling_feats["uppercase_ratio"],
            ling_feats["exclamation_ratio"],
            min(ling_feats["word_count"] / 100.0, 10.0),
        ]
    }
