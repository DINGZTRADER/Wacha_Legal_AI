from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
import os

app = FastAPI(
    title="Wacha Legal AI",
    description="Ugandan Legal Assistant Platform",
    version="1.0.0"
)

class LandSafetyRequest(BaseModel):
    tenure_type: str = "mailo"
    seller_name: str = "Mukasa Patrick"
    buyer_name: str = "Grace Namubiru"
    location: str = "Kira, Wakiso District"
    price_ugx: str = "45,000,000"
    is_married: bool = True
    lc1_verified: bool = True
    boundary_opened: bool = True

class DemandLetterRequest(BaseModel):
    creditor_name: str = "Sarah Tumusiime"
    debtor_name: str = "David Kigozi"
    amount_ugx: str = "6,500,000"
    due_date: str = "2026-06-15"
    debt_reason: str = "Unpaid balance for commercial supplies"

@app.post("/api/v1/intake/land-safety")
def check_land_safety(req: LandSafetyRequest):
    risk_level = "GREEN"
    warnings = []
    recommendations = []

    if req.tenure_type in ["kibanja", "unsure"]:
        risk_level = "YELLOW"
        warnings.append("Kibanja land requires consent from both the Mailo Landlord and LC1.")
        recommendations.append("Conduct an on-site boundary inquiry with neighbors and LC1.")

    if req.is_married:
        warnings.append("Mandatory Spousal Consent: Section 39 of the Land Act (Cap 227) requires the spouse to sign consent.")
        recommendations.append("Attach spouse National ID copy and statutory declaration.")

    if not req.boundary_opened or not req.lc1_verified:
        risk_level = "RED"
        warnings.append("High Fraud Risk: Land purchased without physical boundary opening in the presence of LC1 and neighbors is vulnerable to double-selling.")
        recommendations.append("Do NOT pay until a surveyor and LC1 verify boundaries.")

    agreement = f"""======================================================================
                 LAND PURCHASE & TRANSFER AGREEMENT
======================================================================
DATE: 29th August 2026
LOCATION: {req.location}, Republic of Uganda

PARTIES:
1. SELLER: {req.seller_name} (Ugandan National)
2. BUYER:  {req.buyer_name} (Ugandan National)

1. THE PROPERTY:
The Seller sells land at {req.location}, held under {req.tenure_type.capitalize()} tenure, with boundaries acknowledged by LC1.

2. CONSIDERATION:
Agreed total price is UGX {req.price_ugx}/= (Uganda Shillings {req.price_ugx}).

3. STATUTORY SPOUSAL CONSENT (Section 39, Land Act Cap 227):
I, spouse to the Seller, hereby freely consent to the sale of the subject land.
Signature: ___________________________ Date: ____________________

4. LC1 & NEIGHBOR WITNESSES:
- LC1 Chairperson (Sign & Stamp): _________________________
- Neighbor Witness 1: _____________________________________

SELLER: _________________________    BUYER: _________________________
"""
    return {
        "status": "success",
        "risk_level": risk_level,
        "warnings": warnings,
        "recommendations": recommendations,
        "agreement_draft": agreement
    }

@app.post("/api/v1/generate/demand-letter")
def create_demand_letter(req: DemandLetterRequest):
    letter = f"""======================================================================
                    FORMAL 7-DAY DEMAND NOTICE
      (Under the Judicature Small Claims Procedure Rules)
======================================================================
Date: 29th August 2026

TO: {req.debtor_name}
FROM: {req.creditor_name}

RE: DEMAND FOR PAYMENT OF UGX {req.amount_ugx}/=

TAKE NOTICE that you owe the sum of UGX {req.amount_ugx}/= being {req.debt_reason}, due on {req.due_date}.

DEMAND IS MADE that you pay the full amount within SEVEN (7) DAYS.
Failure to pay will result in legal action in the Small Claims Court without further notice.

Yours faithfully,
{req.creditor_name} (Creditor)
"""
    return {"status": "success", "draft": letter}

@app.get("/", response_class=HTMLResponse)
def serve_ui():
    return """
    <!DOCTYPE html>
    <html>
    <head>
      <title>Wacha Legal AI</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-900 text-white min-h-screen flex items-center justify-center p-6 text-center">
      <div class="max-w-md bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl space-y-4">
        <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto text-xl font-bold">⚖️</div>
        <h1 class="text-2xl font-bold">Wacha Legal AI</h1>
        <p class="text-sm text-slate-400">Ugandan Legal Operations & Citizen Assistant is live on Vercel!</p>
        <div class="p-3 bg-slate-900 rounded-xl text-xs text-emerald-400 font-mono">Backend API: Online (200 OK)</div>
      </div>
    </body>
    </html>
    """

@app.get("/api/health")
def health():
    return {"status": "healthy", "platform": "Wacha Legal AI Uganda", "environment": "Vercel Serverless"}
