import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

# 1. Definisi Variabel Input (Antecedents) dan Output (Consequent)
percobaan_gagal = ctrl.Antecedent(np.arange(0, 11, 1), 'percobaan_gagal')
perubahan_ip = ctrl.Antecedent(np.arange(0, 11, 1), 'perubahan_ip')
anomali_waktu = ctrl.Antecedent(np.arange(0, 11, 1), 'anomali_waktu')
trust_score = ctrl.Consequent(np.arange(0, 101, 1), 'trust_score')

# 2. Fungsi Keanggotaan (Membership Functions) otomatis
percobaan_gagal.automf(3, names=['rendah', 'sedang', 'tinggi'])
perubahan_ip.automf(3, names=['jarang', 'lumayan', 'sering'])
anomali_waktu.automf(3, names=['normal', 'agak_aneh', 'sangat_aneh'])

# Untuk Trust Score, kita buat manual agar lebih presisi
trust_score['untrusted'] = fuzz.trimf(trust_score.universe, [0, 0, 50])
trust_score['suspicious'] = fuzz.trimf(trust_score.universe, [20, 50, 80])
trust_score['trusted'] = fuzz.trimf(trust_score.universe, [50, 100, 100])

# 3. Deklarasi Aturan (Fuzzy Rules)
rule1 = ctrl.Rule(percobaan_gagal['tinggi'] | perubahan_ip['sering'], trust_score['untrusted'])
rule2 = ctrl.Rule(percobaan_gagal['sedang'] & anomali_waktu['agak_aneh'], trust_score['suspicious'])
rule3 = ctrl.Rule(percobaan_gagal['rendah'] & perubahan_ip['jarang'] & anomali_waktu['normal'], trust_score['trusted'])

# 4. Membangun Control System
auth_ctrl = ctrl.ControlSystem([rule1, rule2, rule3])
auth_simulator = ctrl.ControlSystemSimulation(auth_ctrl)

def hitung_skor(jml_gagal: int, jml_ganti_ip: int, tingkat_anomali: int) -> tuple:
    """Menerima input perilaku dan mengembalikan (score, status)"""
    auth_simulator.input['percobaan_gagal'] = jml_gagal
    auth_simulator.input['perubahan_ip'] = jml_ganti_ip
    auth_simulator.input['anomali_waktu'] = tingkat_anomali
    
    # Lakukan kalkulasi
    auth_simulator.compute()
    hasil_skor = int(round(auth_simulator.output['trust_score'], 0))
    
    # Penentuan status string
    if hasil_skor >= 70:
        status = "Trusted"
    elif hasil_skor >= 40:
        status = "Suspicious"
    else:
        status = "Untrusted"
        
    return hasil_skor, status