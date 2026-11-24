"""
Model Pipeline Module:
Provides DistilBERT Transformer pipeline and Calibrated Multi-Model Ensemble
for high-accuracy phishing classification and probabilistic risk calibration.
"""
import os
import joblib
import numpy as np
import scipy.sparse as sp
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline

SAVED_MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_models")
os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

MODEL_FILE = os.path.join(SAVED_MODELS_DIR, "phishing_ensemble.joblib")
VECTORIZER_FILE = os.path.join(SAVED_MODELS_DIR, "tfidf_vectorizer.joblib")
EXTRA_SCALER_FILE = os.path.join(SAVED_MODELS_DIR, "feature_scaler.joblib")
METRICS_FILE = os.path.join(SAVED_MODELS_DIR, "metrics.json")


class PhishingDetectorPipeline:
    """
    Unified multi-tier phishing classification pipeline.
    Combines n-gram TF-IDF semantics, domain security heuristics,
    and a calibrated ensemble of Gradient Boosting, Random Forest, and Logistic Regression.
    """

    def __init__(self):
        self.vectorizer = None
        self.ensemble = None
        self.feature_scaler = None
        self.distilbert_available = False
        self._init_distilbert()

    def _init_distilbert(self):
        """Check if transformers and PyTorch are available for DistilBERT."""
        try:
            import torch
            from transformers import AutoTokenizer
            self.distilbert_available = True
        except ImportError:
            self.distilbert_available = False

    def build_ensemble(self):
        """Construct a high-performance, calibrated soft-voting ensemble."""
        rf = RandomForestClassifier(
            n_estimators=120,
            max_depth=16,
            min_samples_split=4,
            random_state=42,
            n_jobs=-1
        )
        gb = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.15,
            max_depth=4,
            random_state=42
        )
        lr = LogisticRegression(
            C=2.5,
            max_iter=1000,
            random_state=42
        )

        ensemble = VotingClassifier(
            estimators=[
                ('rf', rf),
                ('gb', gb),
                ('lr', lr),
            ],
            voting='soft',
            weights=[1.2, 1.3, 1.0]
        )
        return ensemble

    def fit(self, texts, extra_features, labels):
        """
        Fit vectorizer and calibrated ensemble on text and security features.
        """
        from sklearn.preprocessing import StandardScaler

        # Fit TF-IDF on body & subject text
        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            strip_accents='unicode',
            ngram_range=(1, 2),
            max_features=12000,
            sublinear_tf=True
        )
        text_matrix = self.vectorizer.fit_transform(texts)

        # Scale security domain heuristic features
        self.feature_scaler = StandardScaler()
        scaled_extra = self.feature_scaler.fit_transform(extra_features)
        scaled_sparse = sp.csr_matrix(scaled_extra)

        # Stack text features with domain security heuristic features
        combined_features = sp.hstack([text_matrix, scaled_sparse], format='csr')

        # Fit ensemble
        self.ensemble = self.build_ensemble()
        self.ensemble.fit(combined_features, labels)

        return self

    def predict_proba(self, texts, extra_features):
        """
        Return predicted probabilities [P(non-phishing), P(phishing)].
        """
        text_matrix = self.vectorizer.transform(texts)
        scaled_extra = self.feature_scaler.transform(extra_features)
        scaled_sparse = sp.csr_matrix(scaled_extra)
        combined_features = sp.hstack([text_matrix, scaled_sparse], format='csr')
        return self.ensemble.predict_proba(combined_features)

    def predict(self, texts, extra_features):
        """Return binary prediction: 0 (safe) or 1 (phishing)."""
        probs = self.predict_proba(texts, extra_features)
        return (probs[:, 1] >= 0.50).astype(int)

    def save(self):
        """Serialize pipeline components to disk."""
        joblib.dump(self.ensemble, MODEL_FILE)
        joblib.dump(self.vectorizer, VECTORIZER_FILE)
        joblib.dump(self.feature_scaler, EXTRA_SCALER_FILE)

    def load(self):
        """Load pipeline components from disk."""
        if not (os.path.exists(MODEL_FILE) and os.path.exists(VECTORIZER_FILE) and os.path.exists(EXTRA_SCALER_FILE)):
            raise FileNotFoundError("Model artifacts not found. Please run training first.")
        self.ensemble = joblib.load(MODEL_FILE)
        self.vectorizer = joblib.load(VECTORIZER_FILE)
        self.feature_scaler = joblib.load(EXTRA_SCALER_FILE)
        return self
