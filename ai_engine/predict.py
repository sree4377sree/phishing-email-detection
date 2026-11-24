"""
High-Speed Cached Inference Engine for Phishing Email Detection.
Maintains pipeline artifacts in memory for sub-50ms inference,
with Explainable AI risk factor attribution and token highlighting.
"""
import os
import time
from typing import Dict, Any, List

from ai_engine.feature_extractor import extract_full_feature_vector
from ai_engine.explainability import (
    build_risk_factors, compute_token_attributions, determine_risk_level
)
from ai_engine.model_pipeline import PhishingDetectorPipeline, MODEL_FILE

_CACHED_PIPELINE: PhishingDetectorPipeline = None


def get_pipeline() -> PhishingDetectorPipeline:
    """Lazy-load and cache the trained pipeline."""
    global _CACHED_PIPELINE
    if _CACHED_PIPELINE is None:
        if not os.path.exists(MODEL_FILE):
            from ai_engine.train import run_training
            run_training()

        pipeline = PhishingDetectorPipeline()
        pipeline.load()
        _CACHED_PIPELINE = pipeline

    return _CACHED_PIPELINE


def predict_email(sender: str = "", receiver: str = "", subject: str = "", body: str = "") -> Dict[str, Any]:
    """
    Classify an email with sub-second latency and full explainability.

    Returns:
        dict containing:
            - prediction: 'Phishing' or 'Non-Phishing'
            - is_phishing: bool
            - confidence: float (0.0 to 100.0)
            - risk_score: int (0 to 100)
            - risk_level: 'SAFE' | 'LOW-MEDIUM' | 'HIGH' | 'CRITICAL'
            - risk_factors: list of structured explanation objects
            - highlighted_tokens: list of detected high-risk words
            - url_analysis: summary of detected links
            - header_analysis: spoofing & domain signals
            - linguistic_analysis: lexical signals
            - detected_urls: list of extracted URLs
            - latency_ms: response latency in milliseconds
            - models_used: list of models participating in inference
    """
    start_time = time.perf_counter()

    sender = str(sender or "").strip()
    receiver = str(receiver or "").strip()
    subject = str(subject or "").strip()
    body = str(body or "").strip()

    # 1. Feature Extraction
    features = extract_full_feature_vector(
        sender=sender,
        receiver=receiver,
        subject=subject,
        body=body
    )

    combined_text = f"{subject} {body}".strip()
    if not combined_text:
        combined_text = "empty message"

    # 2. Model Inference
    pipeline = get_pipeline()
    extra_mat = [features["feature_vector"]]
    probs = pipeline.predict_proba([combined_text], extra_mat)[0]

    prob_safe = float(probs[0])
    prob_phish = float(probs[1])

    # 3. Explainable AI & Attributions
    highlighted_tokens = compute_token_attributions(combined_text)

    # 4. Domain Attack Vector Verification & Risk Calibration
    # Phishing attacks require at least one functional attack vector:
    # - Embedded links (especially IP-based, shortened, high-risk TLDs)
    # - Sender domain / brand spoofing
    # - Coercive urgency or threat language
    # - Credential or sensitive financial harvesting
    url_f = features["url_features"]
    hdr_f = features["header_features"]
    ling_f = features["linguistic_features"]
    heuristic_score = features["heuristic_score"]

    attack_vector_count = (
        int(url_f["url_count"] > 0) +
        int(url_f["has_suspicious_url"] > 0) +
        int(hdr_f["is_spoofed_brand"] > 0) +
        int(hdr_f["free_webmail_impersonation"] > 0) +
        int(ling_f["urgency_count"] > 0) +
        int(ling_f["credential_count"] > 0) +
        int(len(highlighted_tokens) > 0)
    )

    if attack_vector_count == 0:
        # No phishing signals, links, or psychological pressure -> calibrate to safe
        fused_phish_score = min(prob_phish * 0.15, 0.15)
    else:
        # Weight ML prediction (70%) with domain heuristics (30%)
        heuristic_prob = heuristic_score / 100.0
        fused_phish_score = (0.70 * prob_phish) + (0.30 * heuristic_prob)

        # Elevate score if critical threats detected
        if url_f["has_ip_url"] or hdr_f["is_spoofed_brand"]:
            fused_phish_score = max(fused_phish_score, 0.85)

    fused_phish_score = max(0.02, min(0.99, fused_phish_score))

    is_phishing = fused_phish_score >= 0.50
    prediction = "Phishing" if is_phishing else "Non-Phishing"
    confidence = fused_phish_score if is_phishing else (1.0 - fused_phish_score)
    risk_score = int(round(fused_phish_score * 100))

    risk_factors = build_risk_factors(features, prediction, confidence)
    risk_level = determine_risk_level(risk_score, is_phishing)

    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return {
        "prediction": prediction,
        "is_phishing": is_phishing,
        "confidence": round(confidence * 100, 1),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "highlighted_tokens": highlighted_tokens,
        "url_analysis": url_f,
        "header_analysis": hdr_f,
        "linguistic_analysis": ling_f,
        "detected_urls": features["urls"],
        "latency_ms": latency_ms,
        "models_used": [
            "DistilBERT Feature Extraction & Embeddings",
            "Calibrated Random Forest Classifier",
            "Gradient Boosting Classifier",
            "L2-Regularized Logistic Regression",
            "Cybersecurity Domain Heuristic Engine",
        ]
    }
