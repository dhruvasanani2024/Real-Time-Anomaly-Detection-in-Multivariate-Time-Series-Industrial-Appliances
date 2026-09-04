import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

import torch
import torch.nn as nn
import numpy as np
import joblib
from config.settings import settings

class LSTMAutoencoder(nn.Module):
    def __init__(self, input_dim, hidden_dim=32, latent_dim=8, num_layers=1):
        super(LSTMAutoencoder, self).__init__()
        self.encoder_lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True)
        self.encoder_fc = nn.Linear(hidden_dim, latent_dim)
        self.decoder_fc = nn.Linear(latent_dim, hidden_dim)
        self.decoder_lstm = nn.LSTM(hidden_dim, hidden_dim, num_layers, batch_first=True)
        self.decoder_fc_out = nn.Linear(hidden_dim, input_dim)

    def forward(self, x):
        lstm_out, _ = self.encoder_lstm(x)
        last_hidden = lstm_out[:, -1, :]
        latent = self.encoder_fc(last_hidden)
        hidden_expanded = self.decoder_fc(latent).unsqueeze(1).repeat(1, x.size(1), 1)
        decoded, _ = self.decoder_lstm(hidden_expanded)
        return self.decoder_fc_out(decoded)

def load_artifacts():
    print("Loading artifacts...")
    
    scaler = joblib.load(settings.SCALER_PATH)
    print("✅ Scaler loaded")
    
    with open(settings.SENSOR_COLS_PATH, 'r') as f:
        sensor_cols = f.read().split(',')
    print(f"✅ {len(sensor_cols)} sensor columns loaded")
    
    if_model = joblib.load(settings.IF_MODEL_PATH)
    print("✅ Isolation Forest loaded")
    
    with open(settings.SEQ_LEN_PATH, 'r') as f:
        seq_len = int(f.read().strip())
    print(f"✅ Sequence length: {seq_len}")
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    lstm_model = LSTMAutoencoder(input_dim=len(sensor_cols)).to(device)
    lstm_model.load_state_dict(torch.load(settings.LSTM_MODEL_PATH, map_location=device))
    lstm_model.eval()
    print(f"✅ LSTM model loaded (device: {device})")
    
    threshold = np.load(settings.THRESHOLD_PATH).item()
    print(f"✅ Threshold: {threshold:.6f}")
    
    return {
        "scaler": scaler,
        "sensor_cols": sensor_cols,
        "if_model": if_model,
        "seq_len": seq_len,
        "lstm_model": lstm_model,
        "threshold": threshold,
        "device": device
    }