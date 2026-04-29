"""
chatbot.py
Keyword-based NLP Chatbot for MediEquip Pro
──────────────────────────────────────────
Handles product queries, recommendations, and general FAQ.
No external AI API needed — pure Python keyword matching.
"""

import re

# ─── Knowledge Base ─────────────────────────────────────────────────────────────

PRODUCT_INFO = {
    "mri": {
        "name": "MRI Machine",
        "description": (
            "An MRI (Magnetic Resonance Imaging) machine uses powerful magnets and radio waves "
            "to generate detailed images of internal organs and tissues — especially effective for "
            "brain, spine, joints, and soft tissue diagnosis. "
            "Available in 1.5T and 3.0T configurations."
        ),
        "use_case": "Neurology, Orthopedics, Oncology, Cardiology",
    },
    "ct": {
        "name": "CT Scan Machine",
        "description": (
            "A CT (Computed Tomography) scanner uses X-rays to produce detailed cross-sectional images "
            "of the body. Our multi-slice CT systems (64–256 slices) deliver fast, high-resolution imaging "
            "ideal for emergency diagnostics, vascular studies, and cancer screening."
        ),
        "use_case": "Emergency Medicine, Oncology, Vascular Imaging",
    },
    "ventilator": {
        "name": "ICU Ventilator",
        "description": (
            "Our ICU ventilators support both invasive and non-invasive mechanical ventilation. "
            "Featuring modes such as VC, PC, SIMV, CPAP, and BiPAP, they are designed for critically "
            "ill patients in intensive care units, operating theaters, and emergency departments."
        ),
        "use_case": "ICU, Emergency, Post-Surgery, ARDS management",
    },
    "xray": {
        "name": "Digital X-Ray System",
        "description": (
            "Our Digital Radiography (DR) systems use flat-panel amorphous silicon detectors to capture "
            "high-resolution images with significantly reduced radiation dose compared to traditional film. "
            "DICOM 3.0 compatible for seamless PACS integration."
        ),
        "use_case": "General Radiology, Chest, Bone & Fracture, Emergency",
    },
    "ultrasound": {
        "name": "Ultrasound Machine",
        "description": (
            "High-definition ultrasound systems supporting 2D, 3D, 4D, and Doppler imaging. "
            "Available in both portable and console configurations for obstetrics, "
            "cardiology, and general abdominal imaging."
        ),
        "use_case": "Obstetrics, Cardiology, Abdominal, Vascular",
    },
    "monitor": {
        "name": "Patient Monitor",
        "description": (
            "Multi-parameter bedside monitors track ECG, SpO2, NIBP, temperature, and EtCO2 in real time. "
            "Built-in Wi-Fi and HL7 connectivity enable integration with hospital information systems."
        ),
        "use_case": "ICU, OT, General Ward, Step-down Units",
    },
}

# Keyword → product key mapping
KEYWORD_MAP = {
    "mri": "mri", "magnetic resonance": "mri", "brain scan": "mri",
    "spine": "mri", "mri machine": "mri",

    "ct": "ct", "ct scan": "ct", "computed tomography": "ct",
    "cat scan": "ct", "scanner": "ct",

    "ventilator": "ventilator", "icu ventilator": "ventilator",
    "breathing machine": "ventilator", "mechanical ventilation": "ventilator",
    "cpap": "ventilator", "bipap": "ventilator", "ards": "ventilator",

    "xray": "xray", "x-ray": "xray", "x ray": "xray",
    "radiograph": "xray", "digital xray": "xray", "chest xray": "xray",

    "ultrasound": "ultrasound", "sonography": "ultrasound",
    "usg": "ultrasound", "doppler": "ultrasound", "echo": "ultrasound",

    "patient monitor": "monitor", "monitor": "monitor",
    "ecg monitor": "monitor", "vitals": "monitor", "spo2": "monitor",
}

# Smart recommendations: department/keyword → suggested equipment list
RECOMMENDATION_MAP = {
    "icu":         ["ICU Ventilator", "Patient Monitor"],
    "intensive care": ["ICU Ventilator", "Patient Monitor"],
    "radiology":   ["MRI Machine", "CT Scan Machine", "Digital X-Ray System", "Ultrasound Machine"],
    "emergency":   ["CT Scan Machine", "Digital X-Ray System", "ICU Ventilator", "Patient Monitor"],
    "neurology":   ["MRI Machine", "CT Scan Machine"],
    "oncology":    ["MRI Machine", "CT Scan Machine"],
    "orthopedic":  ["MRI Machine", "Digital X-Ray System"],
    "chest":       ["Digital X-Ray System", "ICU Ventilator"],
    "obstetrics":  ["Ultrasound Machine"],
    "cardiology":  ["Ultrasound Machine", "Patient Monitor"],
    "general ward": ["Patient Monitor", "Digital X-Ray System"],
    "operation theater": ["Patient Monitor", "ICU Ventilator"],
    "ot":          ["Patient Monitor", "ICU Ventilator"],
}

# ─── General FAQ Responses ───────────────────────────────────────────────────────

FAQ_RESPONSES = {
    ("hello", "hi", "hey", "good morning", "good evening", "howdy"): (
        "Hello! 👋 Welcome to MediEquip Pro. I'm your virtual assistant here to help you explore "
        "our range of hospital-grade medical equipment. How can I assist you today?"
    ),
    ("price", "cost", "rate", "pricing", "how much", "quote", "quotation"): (
        "We follow a quote-based pricing model tailored to your hospital's specific requirements. "
        "Pricing depends on configuration, installation, training, and AMC. "
        "Please submit an inquiry via our Contact page and our sales team will provide a detailed quotation within 24 hours. 📋"
    ),
    ("available", "availability", "stock", "in stock"): (
        "All equipment listed on our website is currently available. "
        "Delivery timelines vary by equipment and location. "
        "Please raise an inquiry for exact delivery schedules for your facility."
    ),
    ("install", "installation", "setup", "commissioning"): (
        "Yes — we provide full on-site installation, commissioning, and biomedical engineer training "
        "for all equipment. Our certified technicians handle end-to-end setup. "
        "This can be discussed in detail when you submit an inquiry."
    ),
    ("warranty", "guarantee", "amc", "service", "maintenance", "support"): (
        "All our equipment comes with a standard manufacturer warranty. "
        "We also offer Annual Maintenance Contracts (AMC) and Comprehensive Maintenance Contracts (CMC) "
        "to ensure maximum uptime. Details are shared at the time of quotation."
    ),
    ("who are you", "what are you", "your name", "are you a bot", "are you ai"): (
        "I'm MediBot 🤖 — the virtual assistant for MediEquip Pro. "
        "I can answer questions about our medical equipment, help you understand which machines suit your department, "
        "and guide you through raising an inquiry. What would you like to know?"
    ),
    ("contact", "reach", "phone", "email", "address", "office"): (
        "📍 MediEquip Pro, Medical Zone, New Delhi, India\n"
        "📞 +91-11-4567-8900\n"
        "📧 sales@mediequippro.com\n\n"
        "You can also use our Contact page to submit an inquiry directly."
    ),
    ("thank", "thanks", "thank you", "thx"): (
        "You're welcome! 😊 If you have more questions or would like to request a quote, feel free to ask anytime."
    ),
    ("bye", "goodbye", "see you", "exit"): (
        "Thank you for visiting MediEquip Pro! 👋 "
        "If you need a quotation or have further questions, don't hesitate to reach out. Have a great day!"
    ),
}

# ─── Core Functions ──────────────────────────────────────────────────────────────

def normalize(text: str) -> str:
    """Lowercase, strip punctuation, normalize spaces."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text


def get_chatbot_response(user_message: str) -> str:
    """
    Main NLP function.
    Priority: Product match → FAQ match → Default fallback.
    """
    msg = normalize(user_message)

    # 1. Check for product keyword matches
    for keyword, product_key in KEYWORD_MAP.items():
        if keyword in msg:
            info = PRODUCT_INFO[product_key]
            return (
                f"**{info['name']}** 🏥\n\n"
                f"{info['description']}\n\n"
                f"**Typical Use Cases:** {info['use_case']}\n\n"
                f"To get a detailed quotation and technical specifications for your facility, "
                f"please submit an inquiry through our Contact page and our team will respond within 24 hours."
            )

    # 2. Check FAQ keyword matches
    for keywords, response in FAQ_RESPONSES.items():
        if any(kw in msg for kw in keywords):
            return response

    # 3. Check for "provide", "sell", "do you have" type queries
    if any(word in msg for word in ["provide", "sell", "supply", "have", "offer", "do you"]):
        return (
            "Yes! MediEquip Pro supplies a wide range of hospital-grade medical equipment including:\n\n"
            "🔬 **MRI Machines** | 🔭 **CT Scanners** | 💨 **ICU Ventilators**\n"
            "📡 **Digital X-Ray Systems** | 🔊 **Ultrasound Machines** | 📊 **Patient Monitors**\n\n"
            "All equipment is available for hospitals, diagnostic centers, and nursing homes. "
            "Please visit our Products page or submit an inquiry for a customized quote."
        )

    # 4. Default fallback
    return (
        "I'm sorry, I didn't quite understand that. 🤔 I can help you with:\n\n"
        "• Information about MRI, CT Scan, Ventilators, X-Ray, Ultrasound, Patient Monitors\n"
        "• Pricing & quotation process\n"
        "• Warranty, installation & AMC details\n"
        "• Contact information\n\n"
        "Try asking something like: *'What is an MRI machine?'* or *'Tell me about ventilators'* "
        "or type **help** for more options."
    )


def get_recommendations(user_message: str) -> list:
    """
    Returns a list of recommended equipment names based on department/context keywords.
    Used by the chatbot to suggest relevant products.
    """
    msg = normalize(user_message)
    for keyword, equipment_list in RECOMMENDATION_MAP.items():
        if keyword in msg:
            return equipment_list
    return []
