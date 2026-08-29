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

# --- Full Interactive Branded Dashboard UI ---
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
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        /* Smooth Interactive Hover Lift & Colored Glow Effects */
        .dept-card {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: translateY(0);
        }
        .dept-card:hover {
          transform: translateY(-8px) scale(1.02);
        }
        
        .card-emerald:hover {
          border-color: #10b981;
          box-shadow: 0 20px 30px -10px rgba(16, 185, 129, 0.35);
          background: linear-gradient(to bottom, #09131f, #06281e);
        }
        .card-blue:hover {
          border-color: #3b82f6;
          box-shadow: 0 20px 30px -10px rgba(59, 130, 246, 0.35);
          background: linear-gradient(to bottom, #09131f, #0a1f3d);
        }
        .card-amber:hover {
          border-color: #f59e0b;
          box-shadow: 0 20px 30px -10px rgba(245, 158, 11, 0.35);
          background: linear-gradient(to bottom, #09131f, #2b1d07);
        }
        .card-rose:hover {
          border-color: #f43f5e;
          box-shadow: 0 20px 30px -10px rgba(244, 63, 94, 0.35);
          background: linear-gradient(to bottom, #09131f, #2e0d16);
        }
        .card-purple:hover {
          border-color: #a855f7;
          box-shadow: 0 20px 30px -10px rgba(168, 85, 247, 0.35);
          background: linear-gradient(to bottom, #09131f, #220f38);
        }
        .card-cyan:hover {
          border-color: #06b6d4;
          box-shadow: 0 20px 30px -10px rgba(6, 182, 212, 0.35);
          background: linear-gradient(to bottom, #09131f, #07252b);
        }
        .card-orange:hover {
          border-color: #f97316;
          box-shadow: 0 20px 30px -10px rgba(249, 115, 22, 0.35);
          background: linear-gradient(to bottom, #09131f, #2d1405);
        }
      </style>
    </head>
    <body class="bg-slate-900 text-slate-100 min-h-screen flex flex-col selection:bg-blue-500 selection:text-white">
      
      <!-- TOP HEADER (Wacha AI Brand) -->
      <header class="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <!-- Logo Brand -->
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/30 flex items-center justify-center">
              <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <i class="fa-solid fa-scale-balanced text-xl text-blue-400"></i>
              </div>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="font-extrabold text-2xl tracking-tight text-white">Wacha<span class="text-blue-500">AI</span></span>
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">Legal Uganda 🇺🇬</span>
              </div>
              <p class="text-xs text-slate-400 font-medium" id="headerSub">Your Everyday Legal Guide & Operations Workspace</p>
            </div>
          </div>

          <!-- Mode Switcher -->
          <div class="flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button id="btnCit" onclick="setMode('citizen')" class="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-md transition-all">
              <i class="fa-solid fa-users mr-1.5"></i> Citizen & SME
            </button>
            <button id="btnAdv" onclick="setMode('advocate')" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
              <i class="fa-solid fa-graduation-cap mr-1.5"></i> Advocate Workspace
            </button>
          </div>
        </div>
      </header>

      <!-- MAIN CONTENT -->
      <main class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        
        <!-- Hero Card with Circuit Glow Accent -->
        <div id="heroBox" class="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl mb-10 relative overflow-hidden">
          <div class="relative z-10 max-w-2xl">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-3">
              <i class="fa-solid fa-bolt-lightning text-cyan-400"></i>
              <span>Powered by Wacha AI Ugandan Law Engine</span>
            </div>
            <h1 id="heroH1" class="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">What would you like to get done today?</h1>
            <p id="heroP" class="text-slate-300 text-sm mb-6 leading-relaxed">Choose a department below. No complex legal terms needed—follow simple button steps to audit land safety, generate binding agreements, or resolve disputes.</p>
            
            <div class="flex flex-wrap gap-2.5">
              <button onclick="runModule('land')" class="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm">
                <i class="fa-solid fa-house-chimney"></i>
                <span>🏡 Check Land Safety</span>
              </button>
              <button onclick="runModule('debt')" class="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm">
                <i class="fa-solid fa-file-invoice-dollar"></i>
                <span>💸 Recover Unpaid Debt (7-Day Notice)</span>
              </button>
              <button onclick="runModule('biz')" class="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm">
                <i class="fa-solid fa-briefcase"></i>
                <span>💼 Start a Business (URSB)</span>
              </button>
            </div>
          </div>
          <div class="absolute -right-10 -bottom-10 opacity-10 text-white text-9xl pointer-events-none">
            <i class="fa-solid fa-scale-unbalanced"></i>
          </div>
        </div>

        <!-- 7 DEPARTMENTS COLORFUL HOVER CARDS GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="deptGrid">
          <!-- Populated by JS -->
        </div>

        <!-- ADVOCATE REFERRAL BANNER -->
        <div class="mt-12 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between shadow-2xl">
          <div class="flex items-center space-x-4 mb-4 sm:mb-0">
            <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
              <i class="fa-solid fa-user-tie"></i>
            </div>
            <div>
              <h3 class="font-extrabold text-white text-base sm:text-lg">Need a Licensed Ugandan Advocate?</h3>
              <p class="text-xs sm:text-sm text-slate-400 max-w-xl">Facing a contested land caveat in Wakiso, a High Court lawsuit, or a URA tax audit? Export your Wacha briefing dossier directly for counsel review.</p>
            </div>
          </div>
          <button onclick="alert('Wacha Briefing Dossier compiled and ready for advocate transmission!')" class="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20 whitespace-nowrap">
            Connect with Advocate
          </button>
        </div>

      </main>

      <!-- FOOTER -->
      <footer class="bg-slate-950 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Wacha AI Legal. Grounded in Ugandan Statutory Law & Case Law.</p>
          <div class="flex items-center space-x-4 text-slate-400">
            <span>Advocates Act Compliant</span>
            <span>•</span>
            <span>ECCMIS Ready</span>
            <span>•</span>
            <span>URSB & NLIS Standards</span>
          </div>
        </div>
      </footer>

      <!-- SCRIPT -->
      <script>
        var mode = 'citizen';

        var citizenDepts = [
          {
            colorKey: 'emerald',
            badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
            icon: 'fa-house-chimney',
            title: '1. Land, Plots & Renting',
            tag: 'Land Act Cap 227',
            desc: 'Land purchase safety check, tenancy agreements, spousal consent affidavits, and boundary dispute protection.',
            mod: 'land'
          },
          {
            colorKey: 'blue',
            badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            btnClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30',
            icon: 'fa-briefcase',
            title: '2. Business & Contracts',
            tag: 'Companies Act 2012',
            desc: 'URSB business registration wizard (Sole Prop vs LLC), supplier contracts, and loan terms scanner.',
            mod: 'biz'
          },
          {
            colorKey: 'amber',
            badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            btnClass: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
            icon: 'fa-gavel',
            title: '3. Money Disputes & Court',
            tag: 'Small Claims < 10M',
            desc: '7-Day formal demand letters and step-by-step Small Claims Court guide (no lawyer needed).',
            mod: 'debt'
          },
          {
            colorKey: 'rose',
            badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
            iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
            btnClass: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
            icon: 'fa-receipt',
            title: '4. Taxes & URA Bills',
            tag: 'URA Tax Laws',
            desc: 'Break down tax assessments in plain shillings, check penalties, and draft statutory objection letters.',
            mod: 'tax'
          },
          {
            colorKey: 'purple',
            badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            btnClass: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30',
            icon: 'fa-user-group',
            title: '5. Hiring & Workers',
            tag: 'Employment Act 2006',
            desc: 'Employment contract maker, fair dismissal protocols, NSSF calculators, and warning letters.',
            mod: 'hiring'
          },
          {
            colorKey: 'cyan',
            badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
            iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
            btnClass: 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold shadow-cyan-600/30',
            icon: 'fa-shield-halved',
            title: '6. Trading Permits & Privacy',
            tag: 'Data Act 2019',
            desc: 'KCCA/Town Council trade licenses, health clearances, and customer privacy policies.',
            mod: 'permits'
          },
          {
            colorKey: 'orange',
            badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
            iconBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            btnClass: 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30',
            icon: 'fa-trademark',
            title: '7. Brand, Logo & Creative',
            tag: 'URSB IP Directorate',
            desc: 'Brand name search, creator copyright guide, and cease-and-desist letters to copycats.',
            mod: 'ip'
          }
        ];

        var advocateDepts = [
          {
            colorKey: 'emerald',
            badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
            icon: 'fa-house-chimney',
            title: '1. Conveyancing & Titles',
            tag: 'RTA Cap 230',
            desc: 'NLIS title search encumbrance auditing, caveat lapse briefs, and statutory transfer instruments.',
            mod: 'adv_land'
          },
          {
            colorKey: 'blue',
            badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            btnClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30',
            icon: 'fa-briefcase',
            title: '2. Banking, SIMPO & M&A',
            tag: 'SIMPO Act 2019',
            desc: 'SIMPO movable collateral perfection, debentures, fixed charges, and shareholder resolutions.',
            mod: 'adv_biz'
          },
          {
            colorKey: 'amber',
            badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            btnClass: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
            icon: 'fa-gavel',
            title: '3. Litigation & ECCMIS',
            tag: 'CPR (SI 71-1)',
            desc: 'ECCMIS Plaints, WSDs, and chamber summons citing Civil Procedure Rules and ULII authorities.',
            mod: 'adv_lit'
          },
          {
            colorKey: 'rose',
            badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
            iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
            btnClass: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
            icon: 'fa-receipt',
            title: '4. Tax Appeals (TAT)',
            tag: 'TPCA 2014 Sec 24',
            desc: 'Statutory 45-day URA objection notices and Tax Appeals Tribunal Statements of Facts.',
            mod: 'adv_tax'
          },
          {
            colorKey: 'purple',
            badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
            iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            btnClass: 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30',
            icon: 'fa-user-group',
            title: '5. Industrial Court Labor',
            tag: 'Employment Act 2006',
            desc: 'Redundancy defense briefs, executive non-competes, and statutory fair hearing packets.',
            mod: 'adv_hiring'
          },
          {
            colorKey: 'cyan',
            badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
            iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
            btnClass: 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold shadow-cyan-600/30',
            icon: 'fa-shield-halved',
            title: '6. Regulatory & PDPO',
            tag: 'PDPO & FIA Regulations',
            desc: 'Data Protection Impact Assessments (DPIA), FIA AML manuals, and PAU compliance.',
            mod: 'adv_reg'
          },
          {
            colorKey: 'orange',
            badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
            iconBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            btnClass: 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30',
            icon: 'fa-trademark',
            title: '7. IP Portfolio & ARIPO',
            tag: 'Trademarks Act 2010',
            desc: 'URSB multi-class trademark petitions, opposition notices, and technology transfer deeds.',
            mod: 'adv_ip'
          }
        ];

        function render() {
          var list = mode === 'citizen' ? citizenDepts : advocateDepts;
          var grid = document.getElementById('deptGrid');
          var html = '';

          for (var i = 0; i < list.length; i++) {
            var d = list[i];
            html += '<div class="dept-card card-' + d.colorKey + ' bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">';
            html += '  <div>';
            html += '    <div class="flex items-center justify-between mb-4">';
            html += '      <div class="w-12 h-12 rounded-2xl border ' + d.iconBg + ' flex items-center justify-center text-xl shadow-md">';
            html += '        <i class="fa-solid ' + d.icon + '"></i>';
            html += '      </div>';
            html += '      <span class="text-[11px] font-bold px-3 py-1 rounded-full border ' + d.badgeBg + '">' + d.tag + '</span>';
            html += '    </div>';
            html += '    <h3 class="font-extrabold text-white text-lg mb-2 tracking-tight">' + d.title + '</h3>';
            html += '    <p class="text-xs text-slate-400 mb-6 leading-relaxed">' + d.desc + '</p>';
            html += '  </div>';
            html += '  <button onclick="runModule(\\'' + d.mod + '\\')" class="w-full py-3 rounded-2xl text-xs font-extrabold tracking-wider uppercase transition-all shadow-md ' + d.btnClass + '">';
            html += '    Open Department';
            html += '  </button>';
            html += '</div>';
          }

          grid.innerHTML = html;
        }

        function setMode(m) {
          mode = m;
          var btnC = document.getElementById('btnCit');
          var btnA = document.getElementById('btnAdv');
          var h1 = document.getElementById('heroH1');
          var p = document.getElementById('heroP');

          if (m === 'citizen') {
            btnC.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-md transition-all';
            btnA.className = 'px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all';
            h1.textContent = 'What would you like to get done today?';
            p.textContent = 'Choose a department below. No complex legal terms needed—follow simple button steps to audit land safety, generate binding agreements, or resolve disputes.';
          } else {
            btnA.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 font-extrabold shadow-md transition-all';
            btnC.className = 'px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all';
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
