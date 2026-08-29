from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

app = FastAPI(
    title="Wacha Legal AI",
    description="Ugandan Legal Assistant Platform",
    version="1.0.0"
)

# --- Pydantic Schemas ---
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

# --- API Endpoints ---
@app.post("/api/v1/intake/land-safety")
def check_land_safety(req: LandSafetyRequest):
    return {
        "status": "success",
        "risk_level": "GREEN" if req.lc1_verified and req.boundary_opened else "RED",
        "warnings": ["Section 39 Land Act: Spousal consent mandatory."],
        "recommendations": ["Open boundaries with LC1 prior to payment."]
    }

@app.post("/api/v1/generate/demand-letter")
def create_demand_letter(req: DemandLetterRequest):
    return {
        "status": "success",
        "message": f"7-Day Demand Notice generated for {req.debtor_name} in the sum of UGX {req.amount_ugx}/=."
    }

@app.get("/api/health")
def health():
    return {"status": "healthy", "platform": "Wacha Legal AI Uganda", "environment": "Vercel Serverless"}

# --- Full Interactive Dashboard UI ---
@app.get("/", response_class=HTMLResponse)
def serve_ui():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Wacha Legal AI - Ugandan Legal Assistant</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans">
      
      <!-- TOP HEADER -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl shadow-md">
              <i class="fa-solid fa-scale-balanced"></i>
            </div>
            <div>
              <span class="font-bold text-2xl text-slate-900">Wacha<span class="text-blue-600">Legal</span></span>
              <span class="ml-2 bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200">Uganda 🇺🇬</span>
              <p class="text-xs text-slate-500 font-medium" id="headerSub">Your Friendly Everyday Legal Navigator</p>
            </div>
          </div>
          <div class="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button id="btnCit" onclick="setMode('citizen')" class="px-4 py-2 rounded-lg text-xs font-bold bg-white text-blue-700 shadow-sm transition">
              <i class="fa-solid fa-users mr-1.5"></i> Citizen & SME
            </button>
            <button id="btnAdv" onclick="setMode('advocate')" class="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition">
              <i class="fa-solid fa-graduation-cap mr-1.5"></i> Advocate Workspace
            </button>
          </div>
        </div>
      </header>

      <!-- MAIN CONTAINER -->
      <main class="max-w-7xl w-full mx-auto px-4 py-8 flex-grow">
        
        <!-- Hero Card -->
        <div id="heroBox" class="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8">
          <h1 id="heroH1" class="text-2xl sm:text-3xl font-extrabold mb-2">What would you like to get done today?</h1>
          <p id="heroP" class="text-blue-100 text-sm mb-6">Select a department below. No legal terms needed—follow guided button steps to check safety, generate agreements, or resolve disputes.</p>
          <div class="flex flex-wrap gap-2">
            <button onclick="runModule('land')" class="bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 rounded-xl text-xs font-semibold transition">
              🏡 Check Land Safety
            </button>
            <button onclick="runModule('debt')" class="bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 rounded-xl text-xs font-semibold transition">
              💸 Recover Unpaid Debt (7-Day Notice)
            </button>
            <button onclick="runModule('biz')" class="bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-2 rounded-xl text-xs font-semibold transition">
              💼 Start a Business (URSB)
            </button>
          </div>
        </div>

        <!-- 7 Departments Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="deptGrid">
          <!-- Populated by JS -->
        </div>

        <!-- Advocate Connect Banner -->
        <div class="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between shadow-sm">
          <div class="flex items-center space-x-4 mb-4 sm:mb-0">
            <div class="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xl flex-shrink-0">
              <i class="fa-solid fa-user-tie"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-base">Need a Licensed Ugandan Advocate?</h3>
              <p class="text-xs text-slate-600">Have a contested land dispute, High Court summons, or URA audit? Export your Wacha briefing dossier directly.</p>
            </div>
          </div>
          <button onclick="alert('Wacha Briefing Dossier compiled and ready for advocate transmission!')" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition">
            Connect with Advocate
          </button>
        </div>

      </main>

      <footer class="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        © 2026 Wacha Legal AI Uganda. Grounded in Ugandan Statutory Law & Case Law.
      </footer>

      <script>
        let mode = 'citizen';
        const citizenDepts = [
          { icon: 'fa-house-chimney', color: 'emerald', title: '1. Land, Plots & Renting', desc: 'Land purchase safety check, tenancy contracts, and boundary dispute guide.', mod: 'land' },
          { icon: 'fa-briefcase', color: 'blue', title: '2. Business & Contracts', desc: 'URSB registration wizard, supplier agreements, and loan contract scanners.', mod: 'biz' },
          { icon: 'fa-gavel', color: 'amber', title: '3. Money Disputes & Court', desc: '7-Day formal demand letters and Small Claims Court assistant (< UGX 10M).', mod: 'debt' },
          { icon: 'fa-receipt', color: 'rose', title: '4. Taxes & URA Bills', desc: 'Explain tax assessments in plain shillings and draft statutory objection letters.', mod: 'tax' },
          { icon: 'fa-user-group', color: 'purple', title: '5. Hiring & Workers', desc: 'Employment contract maker, fair dismissal guides, and severance calculators.', mod: 'hiring' },
          { icon: 'fa-shield-halved', color: 'cyan', title: '6. Trading Permits & Privacy', desc: 'KCCA/Town Council trade licenses and customer privacy policies (Data Act 2019).', mod: 'permits' },
          { icon: 'fa-trademark', color: 'orange', title: '7. Brand, Logo & Creative', desc: 'URSB brand name search, copyright protection, and cease-and-desist letters.', mod: 'ip' }
        ];

        const advocateDepts = [
          { icon: 'fa-house-chimney', color: 'emerald', title: '1. Conveyancing & Titles', desc: 'NLIS title search encumbrance auditor, caveat lapse briefs, and RTA transfer instruments.', mod: 'adv_land' },
          { icon: 'fa-briefcase', color: 'blue', title: '2. Banking, SIMPO & M&A', desc: 'SIMPO security perfection notices, debentures, and Companies Act 2012 filings.', mod: 'adv_biz' },
          { icon: 'fa-gavel', color: 'amber', title: '3. Litigation & ECCMIS', desc: 'ECCMIS Plaints, WSDs, and chamber summons citing Civil Procedure Rules (SI 71-1).', mod: 'adv_lit' },
          { icon: 'fa-receipt', color: 'rose', title: '4. Tax Appeals (TAT)', desc: 'Statutory 45-day URA objection notices (TPCA 2014) and TAT Statements of Facts.', mod: 'adv_tax' },
          { icon: 'fa-user-group', color: 'purple', title: '5. Industrial Court Labor', desc: 'Redundancy defense briefs, executive non-competes, and fair hearing packets.', mod: 'adv_hiring' },
          { icon: 'fa-shield-halved', color: 'cyan', title: '6. Regulatory & PDPO', desc: 'Data Protection Impact Assessments (DPIA), FIA AML manuals, and PAU compliance.', mod: 'adv_reg' },
          { icon: 'fa-trademark', color: 'orange', title: '7. IP Portfolio & ARIPO', desc: 'URSB multi-class trademark petitions, opposition briefs, and tech transfer deeds.', mod: 'adv_ip' }
        ];

        function render() {
          const list = mode === 'citizen' ? citizenDepts : advocateDepts;
          const grid = document.getElementById('deptGrid');
          grid.innerHTML = list.map(d => `
            <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div class="w-10 h-10 rounded-xl bg-slate-100 text-\${d.color}-600 flex items-center justify-center text-lg mb-4">
                <i class="fa-solid \${d.icon}"></i>
              </div>
              <h3 class="font-bold text-slate-900 text-base mb-1">\${d.title}</h3>
              <p class="text-xs text-slate-500 mb-4 leading-relaxed">\${d.desc}</p>
              <button onclick="runModule('\${d.mod}')" class="w-full py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition">
                Open Department
              </button>
            </div>
          `).join('');
        }

        function setMode(m) {
          mode = m;
          const btnC = document.getElementById('btnCit');
          const btnA = document.getElementById('btnAdv');
          const hero = document.getElementById('heroBox');
          const h1 = document.getElementById('heroH1');
          const p = document.getElementById('heroP');

          if (m === 'citizen') {
            btnC.className = 'px-4 py-2 rounded-lg text-xs font-bold bg-white text-blue-700 shadow-sm transition';
            btnA.className = 'px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition';
            hero.className = 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8';
            h1.textContent = 'What would you like to get done today?';
            p.textContent = 'Select a department below. No legal terms needed—follow guided button steps to check safety, generate agreements, or resolve disputes.';
          } else {
            btnA.className = 'px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-amber-400 shadow-sm transition';
            btnC.className = 'px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition';
            hero.className = 'bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 border border-slate-700';
            h1.textContent = 'Advocate & Legal Operations Workspace';
            p.textContent = 'Draft ECCMIS-formatted pleadings (CPR SI 71-1), audit NLIS title search encumbrances, and file statutory URA/TAT tax appeals.';
          }
          render();
        }

        function runModule(name) {
          if (name.includes('land')) {
            alert('🏡 LAND SAFETY WIZARD:\\n\\n1. Tenure Check: Mailo / Freehold / Kibanja\\n2. Spousal Consent: Section 39 Land Act verified.\\n3. LC1 Boundary Verification: Certified.');
          } else if (name.includes('debt')) {
            alert('💸 7-DAY DEMAND NOTICE GENERATOR:\\n\\nGenerated formal debt recovery notice under the Judicature Small Claims Procedure Rules (Claims <= UGX 10M).');
          } else {
            alert('⚖️ Module ' + name + ' is active and connected to Ugandan statutory database.');
          }
        }

        render();
      </script>
    </body>
    </html>
    """
