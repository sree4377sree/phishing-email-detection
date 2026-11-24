"""
Explainable AI (XAI) Module for Phishing Detection.
Generates human-readable risk factors, threat level categorization,
and token-level attribution for frontend visual highlighting.
"""
import re

SUSPICIOUS_TOKEN_WEIGHTS = {
    "urgent": 0.85,
    "urgently": 0.85,
    "immediate": 0.80,
    "immediately": 0.80,
    "suspended": 0.95,
    "suspension": 0.95,
    "terminated": 0.90,
    "compromised": 0.90,
    "unauthorized": 0.90,
    "verify": 0.75,
    "verification": 0.75,
    "validate": 0.70,
    "action": 0.50,
    "required": 0.60,
    "password": 0.85,
    "passcode": 0.85,
    "pin": 0.80,
    "ssn": 0.95,
    "security": 0.55,
    "alert": 0.65,
    "breach": 0.85,
    "bank": 0.65,
    "banking": 0.65,
    "credit": 0.60,
    "debit": 0.60,
    "card": 0.50,
    "cvv": 0.95,
    "wire": 0.80,
    "transfer": 0.60,
    "crypto": 0.70,
    "bitcoin": 0.75,
    "wallet": 0.70,
    "invoice": 0.55,
    "billing": 0.50,
    "locked": 0.85,
    "login": 0.60,
    "click": 0.55,
    "update": 0.50,
    "confirm": 0.60,
    "refund": 0.75,
    "penalty": 0.85,
    "irs": 0.80,
    "overdue": 0.70,
    "final": 0.65,
    "notice": 0.60,
}


def compute_token_attributions(text: str) -> list:
    """
    Split text into words and return attributions for suspicious tokens.
    """
    if not text:
        return []

    words = re.findall(r'\b\w+\b', text)
    tokens_meta = []
    seen = set()

    for word in words:
        clean = word.lower()
        if clean in SUSPICIOUS_TOKEN_WEIGHTS and clean not in seen:
            seen.add(clean)
            tokens_meta.append({
                "word": word,
                "token": clean,
                "weight": SUSPICIOUS_TOKEN_WEIGHTS[clean],
                "category": _categorize_token(clean)
            })

    # Sort tokens by risk weight descending
    tokens_meta.sort(key=lambda x: x["weight"], reverse=True)
    return tokens_meta


def _categorize_token(token: str) -> str:
    urgency = {"urgent", "urgently", "immediate", "immediately", "action", "required", "final", "notice"}
    threat = {"suspended", "suspension", "terminated", "compromised", "unauthorized", "locked", "breach", "penalty"}
    credential = {"password", "passcode", "pin", "verify", "verification", "validate", "login", "confirm", "ssn"}
    financial = {"credit", "debit", "card", "cvv", "bank", "banking", "wire", "transfer", "crypto", "bitcoin", "wallet", "refund", "invoice", "billing"}

    if token in urgency:
        return "Urgency Pressure"
    if token in threat:
        return "Threat / Coercion"
    if token in credential:
        return "Credential Harvesting"
    if token in financial:
        return "Financial Information"
    return "Suspicious Indicator"


def build_risk_factors(feature_dict: dict, prediction_label: str, confidence: float) -> list:
    """
    Generate clear, human-understandable explanation bullet points.
    """
    factors = []
    url_f = feature_dict.get("url_features", {})
    hdr_f = feature_dict.get("header_features", {})
    ling_f = feature_dict.get("linguistic_features", {})

    if url_f.get("has_ip_url"):
        factors.append({
            "severity": "CRITICAL",
            "type": "IP-Based URL",
            "message": "Email contains direct IP address links (e.g., http://192.168...), a common evasion technique to bypass domain blacklists."
        })

    if url_f.get("shortened_url_count", 0) > 0:
        factors.append({
            "severity": "HIGH",
            "type": "URL Shortener Detected",
            "message": f"Contains {url_f['shortened_url_count']} shortened link(s) (e.g. bit.ly, tinyurl), frequently used to conceal true phishing landing pages."
        })

    if url_f.get("high_risk_tld_count", 0) > 0:
        factors.append({
            "severity": "HIGH",
            "type": "High-Risk Domain Extension",
            "message": "Contains links pointing to suspicious top-level domains commonly registered by malicious actors."
        })

    if hdr_f.get("is_spoofed_brand"):
        brand = hdr_f.get("brand_mentioned", "trusted organization").capitalize()
        domain = hdr_f.get("sender_domain", "external domain")
        factors.append({
            "severity": "CRITICAL",
            "type": "Brand Impersonation / Spoofing",
            "message": f"Sender claims to represent {brand}, but the originating domain is '{domain}', indicating an impersonation attempt."
        })

    if hdr_f.get("free_webmail_impersonation"):
        factors.append({
            "severity": "HIGH",
            "type": "Free Webmail Spoofing",
            "message": "A public free webmail address (e.g., Gmail/Yahoo) was used to send an alleged official organizational notification."
        })

    if ling_f.get("urgency_count", 0) >= 2:
        factors.append({
            "severity": "HIGH",
            "type": "Extreme Urgency Psychological Trigger",
            "message": "Multiple high-pressure urgency keywords detected ('immediate action', 'suspended', '24 hours'), attempting to induce rash user action."
        })
    elif ling_f.get("urgency_count", 0) == 1:
        factors.append({
            "severity": "MEDIUM",
            "type": "Urgency Indicator",
            "message": "Urgent wording detected in email body urging quick user intervention."
        })

    if ling_f.get("credential_count", 0) >= 2:
        factors.append({
            "severity": "HIGH",
            "type": "Credential / Financial Harvesting",
            "message": "Requests sensitive personal credentials, passwords, or financial payment details."
        })
    elif ling_f.get("credential_count", 0) == 1:
        factors.append({
            "severity": "MEDIUM",
            "type": "Sensitive Keyword Present",
            "message": "Mentions account authentication or security verification."
        })

    if ling_f.get("uppercase_ratio", 0) > 0.30:
        factors.append({
            "severity": "LOW",
            "type": "Aggressive Formatting",
            "message": "Excessive uppercase text detected, often associated with spam and scareware emails."
        })

    if not factors and prediction_label == "Phishing":
        factors.append({
            "severity": "MEDIUM",
            "type": "Statistical Pattern Match",
            "message": "Semantic language and embedding distribution match verified phishing samples in training corpus."
        })
    elif not factors and prediction_label == "Non-Phishing":
        factors.append({
            "severity": "INFO",
            "type": "No Malicious Indicators",
            "message": "Email conforms to standard conversational patterns without detected deception or high-risk URLs."
        })

    return factors


def determine_risk_level(risk_score: int, is_phishing: bool) -> str:
    """Classify risk score into four standardized cybersecurity tiers."""
    if is_phishing:
        if risk_score >= 75:
            return "CRITICAL"
        elif risk_score >= 50:
            return "HIGH"
        else:
            return "MEDIUM"
    else:
        if risk_score > 35:
            return "LOW-MEDIUM"
        return "SAFE"
