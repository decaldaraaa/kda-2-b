import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

# 1. Definisi Variabel Input (Antecedents) dan Output (Consequent)
percobaan_gagal = ctrl.Antecedent(np.arange(0, 11, 1), 'percobaan_gagal')
perubahan_ip = ctrl.Antecedent(np.arange(0, 11, 1), 'perubahan_ip')
anomali_waktu = ctrl.Antecedent(np.arange(0, 11, 1), 'anomali_waktu')
trust_score = ctrl.Consequent(np.arange(0, 101, 1), 'trust_score')

# 2. Fungsi Keanggotaan (Membership Functions) Manual & Presisi
# Menggunakan Kurva Segitiga (trimf) sesuai standar literatur FIS untuk deteksi anomali
# Lebarkan batas 'rendah' hingga 5, baru dianggap 'sedang' setelahnya
percobaan_gagal['rendah'] = fuzz.trimf(percobaan_gagal.universe, [0, 0, 5])
percobaan_gagal['sedang'] = fuzz.trimf(percobaan_gagal.universe, [4, 7, 10])
percobaan_gagal['tinggi'] = fuzz.trimf(percobaan_gagal.universe, [8, 10, 10])

perubahan_ip['jarang'] = fuzz.trimf(perubahan_ip.universe, [0, 0, 4])
perubahan_ip['lumayan'] = fuzz.trimf(perubahan_ip.universe, [2, 5, 8])
perubahan_ip['sering'] = fuzz.trimf(perubahan_ip.universe, [6, 10, 10])

anomali_waktu['normal'] = fuzz.trimf(anomali_waktu.universe, [0, 0, 4])
anomali_waktu['agak_aneh'] = fuzz.trimf(anomali_waktu.universe, [2, 5, 8])
anomali_waktu['sangat_aneh'] = fuzz.trimf(anomali_waktu.universe, [6, 10, 10])

# Skala Output Trust Score (Kebalikan dari Risk Level) dengan irisan yang rapat
trust_score['untrusted'] = fuzz.trimf(trust_score.universe, [0, 0, 45])
trust_score['suspicious'] = fuzz.trimf(trust_score.universe, [30, 50, 70])
trust_score['trusted'] = fuzz.trimf(trust_score.universe, [55, 100, 100])

# 3. Deklarasi Aturan Lengkap (27 Fuzzy Rules - Matriks 3x3x3)
# -------------------------------------------------------------------------
# KELOMPOK 1: Percobaan Gagal RENDAH (Kondisi Relatif Aman)
# -------------------------------------------------------------------------
rule1 = ctrl.Rule(percobaan_gagal['rendah'] & perubahan_ip['jarang'] & anomali_waktu['normal'], trust_score['trusted'])
rule2 = ctrl.Rule(percobaan_gagal['rendah'] & perubahan_ip['jarang'] & anomali_waktu['agak_aneh'], trust_score['trusted'])
rule3 = ctrl.Rule(percobaan_gagal['rendah'] & perubahan_ip['jarang'] & anomali_waktu['sangat_aneh'], trust_score['suspicious'])

rule4 = ctrl.Rule(percobaan_gagal['rendah'] & perubahan_ip['lumayan'] & anomali_waktu['normal'], trust_score['trusted'])
rule5 = ctrl.Rule(percobaan_gagal['rendah'] & perubahan_ip['lumayan'] & anomali_waktu['agak_aneh'], trust_score['suspicious'])
rule6 = ctrl.Rule(percobaan_gagal['rendah'] & perubahan_ip['lumayan'] & anomali_waktu['sangat_aneh'], trust_score['suspicious'])

rule7 = ctrl.Rule(percobaan_gagal['rendah'] & perubahan_ip['sering'] & anomali_waktu['normal'], trust_score['suspicious'])
rule8 = ctrl.Rule(percobaan_gagal['rendah'] & perubahan_ip['sering'] & anomali_waktu['agak_aneh'], trust_score['suspicious'])
rule9 = ctrl.Rule(percobaan_gagal['rendah'] & perubahan_ip['sering'] & anomali_waktu['sangat_aneh'], trust_score['untrusted'])

# -------------------------------------------------------------------------
# KELOMPOK 2: Percobaan Gagal SEDANG (Kondisi Waspada)
# -------------------------------------------------------------------------
rule10 = ctrl.Rule(percobaan_gagal['sedang'] & perubahan_ip['jarang'] & anomali_waktu['normal'], trust_score['suspicious'])
rule11 = ctrl.Rule(percobaan_gagal['sedang'] & perubahan_ip['jarang'] & anomali_waktu['agak_aneh'], trust_score['suspicious'])
rule12 = ctrl.Rule(percobaan_gagal['sedang'] & perubahan_ip['jarang'] & anomali_waktu['sangat_aneh'], trust_score['untrusted'])

rule13 = ctrl.Rule(percobaan_gagal['sedang'] & perubahan_ip['lumayan'] & anomali_waktu['normal'], trust_score['suspicious'])
rule14 = ctrl.Rule(percobaan_gagal['sedang'] & perubahan_ip['lumayan'] & anomali_waktu['agak_aneh'], trust_score['untrusted'])
rule15 = ctrl.Rule(percobaan_gagal['sedang'] & perubahan_ip['lumayan'] & anomali_waktu['sangat_aneh'], trust_score['untrusted'])

rule16 = ctrl.Rule(percobaan_gagal['sedang'] & perubahan_ip['sering'] & anomali_waktu['normal'], trust_score['untrusted'])
rule17 = ctrl.Rule(percobaan_gagal['sedang'] & perubahan_ip['sering'] & anomali_waktu['agak_aneh'], trust_score['untrusted'])
rule18 = ctrl.Rule(percobaan_gagal['sedang'] & perubahan_ip['sering'] & anomali_waktu['sangat_aneh'], trust_score['untrusted'])

# -------------------------------------------------------------------------
# KELOMPOK 3: Percobaan Gagal TINGGI (Kondisi Bahaya Mutlak / Brute Force)
# Karena gagalnya sudah tinggi, variabel IP dan Waktu apapun tetap Untrusted
# -------------------------------------------------------------------------
rule19 = ctrl.Rule(percobaan_gagal['tinggi'] & perubahan_ip['jarang'] & anomali_waktu['normal'], trust_score['untrusted'])
rule20 = ctrl.Rule(percobaan_gagal['tinggi'] & perubahan_ip['jarang'] & anomali_waktu['agak_aneh'], trust_score['untrusted'])
rule21 = ctrl.Rule(percobaan_gagal['tinggi'] & perubahan_ip['jarang'] & anomali_waktu['sangat_aneh'], trust_score['untrusted'])

rule22 = ctrl.Rule(percobaan_gagal['tinggi'] & perubahan_ip['lumayan'] & anomali_waktu['normal'], trust_score['untrusted'])
rule23 = ctrl.Rule(percobaan_gagal['tinggi'] & perubahan_ip['lumayan'] & anomali_waktu['agak_aneh'], trust_score['untrusted'])
rule24 = ctrl.Rule(percobaan_gagal['tinggi'] & perubahan_ip['lumayan'] & anomali_waktu['sangat_aneh'], trust_score['untrusted'])

rule25 = ctrl.Rule(percobaan_gagal['tinggi'] & perubahan_ip['sering'] & anomali_waktu['normal'], trust_score['untrusted'])
rule26 = ctrl.Rule(percobaan_gagal['tinggi'] & perubahan_ip['sering'] & anomali_waktu['agak_aneh'], trust_score['untrusted'])
rule27 = ctrl.Rule(percobaan_gagal['tinggi'] & perubahan_ip['sering'] & anomali_waktu['sangat_aneh'], trust_score['untrusted'])

# 4. Membangun Control System dengan 27 Aturan
semua_aturan = [
    rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8, rule9,
    rule10, rule11, rule12, rule13, rule14, rule15, rule16, rule17, rule18,
    rule19, rule20, rule21, rule22, rule23, rule24, rule25, rule26, rule27
]

auth_ctrl = ctrl.ControlSystem(semua_aturan)
auth_simulator = ctrl.ControlSystemSimulation(auth_ctrl)

def hitung_skor(jml_gagal: int, jml_ganti_ip: int, tingkat_anomali: int) -> tuple:
    """Menerima input perilaku dan mengembalikan (score, status)"""
    auth_simulator.input['percobaan_gagal'] = jml_gagal
    auth_simulator.input['perubahan_ip'] = jml_ganti_ip
    auth_simulator.input['anomali_waktu'] = tingkat_anomali
    
    # Kalkulasi Centroid
    auth_simulator.compute()
    hasil_skor = int(round(auth_simulator.output['trust_score'], 0))
    
    # Penentuan status string mutlak
    if hasil_skor >= 70:
        status = "Trusted"
    elif hasil_skor >= 40:
        status = "Suspicious"
    else:
        status = "Untrusted"
        
    return hasil_skor, status