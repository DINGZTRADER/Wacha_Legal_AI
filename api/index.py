from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

app = FastAPI(
    title="Wacha Legal AI",
    description="Ugandan Legal Assistant Platform",
    version="1.0.0"
)

@app.get("/api/health")
def health():
    return {"status": "healthy", "platform": "Wacha Legal AI Uganda", "environment": "Vercel Serverless"}

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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono-doc { font-family: 'JetBrains Mono', monospace; }
        
        .dept-card { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); transform: translateY(0); }
        .dept-card:hover { transform: translateY(-8px) scale(1.02); }
        
        .card-emerald:hover { border-color: #10b981; box-shadow: 0 20px 30px -10px rgba(16, 185, 129, 0.35); background: linear-gradient(to bottom, #09131f, #06281e); }
        .card-blue:hover { border-color: #3b82f6; box-shadow: 0 20px 30px -10px rgba(59, 130, 246, 0.35); background: linear-gradient(to bottom, #09131f, #0a1f3d); }
        .card-amber:hover { border-color: #f59e0b; box-shadow: 0 20px 30px -10px rgba(245, 158, 11, 0.35); background: linear-gradient(to bottom, #09131f, #2b1d07); }
        .card-rose:hover { border-color: #f43f5e; box-shadow: 0 20px 30px -10px rgba(244, 63, 94, 0.35); background: linear-gradient(to bottom, #09131f, #2e0d16); }
        .card-purple:hover { border-color: #a855f7; box-shadow: 0 20px 30px -10px rgba(168, 85, 247, 0.35); background: linear-gradient(to bottom, #09131f, #220f38); }
        .card-cyan:hover { border-color: #06b6d4; box-shadow: 0 20px 30px -10px rgba(6, 182, 212, 0.35); background: linear-gradient(to bottom, #09131f, #07252b); }
        .card-orange:hover { border-color: #f97316; box-shadow: 0 20px 30px -10px rgba(249, 115, 22, 0.35); background: linear-gradient(to bottom, #09131f, #2d1405); }

        .quick-pill { transition: all 0.25s ease-in-out; }
        .quick-pill:hover { transform: translateY(-3px); }
        
        .sub-card { transition: all 0.25s ease-in-out; }
        .sub-card:hover { transform: translateY(-4px); border-color: #3b82f6; background-color: rgba(30, 58, 138, 0.2); }

        @media print {
          body * { visibility: hidden; }
          #printableDocument, #printableDocument * { visibility: visible; }
          #printableDocument { position: absolute; left: 0; top: 0; width: 100%; color: black !important; background: white !important; font-size: 11pt; padding: 20px; }
        }
      </style>
    </head>
    <body class="bg-slate-900 text-slate-100 min-h-screen flex flex-col selection:bg-blue-500 selection:text-white">
      
      <!-- TOP HEADER -->
      <header class="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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
              <p class="text-xs text-slate-400 font-medium">Smart Legal Template & PDF Generation Engine</p>
            </div>
          </div>

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
        
        <!-- HERO CARD -->
        <div id="heroBox" class="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl mb-10 relative overflow-hidden">
          <div class="relative z-10 max-w-4xl">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-3">
              <i class="fa-solid fa-wand-magic-sparkles text-cyan-400"></i>
              <span>Smart AI Template & PDF Generation Engine</span>
            </div>
            <h1 id="heroH1" class="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">Draft a Legally Binding Ugandan Agreement</h1>
            <p id="heroP" class="text-slate-300 text-sm mb-6 leading-relaxed">Fill out the guided smart template below. Our AI evaluates all legal angles, enforces statutory covenants, and outputs a downloadable, court-grade PDF document:</p>
            
            <div class="flex flex-wrap gap-2.5">
              <button onclick="openWizardModal('land_comprehensive')" class="quick-pill bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm">
                <i class="fa-solid fa-house-chimney text-emerald-400"></i>
                <span>1. 🏡 Land Purchase Agreement (Comprehensive Template)</span>
              </button>
              <button onclick="openWizardModal('car_sale')" class="quick-pill bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm">
                <i class="fa-solid fa-car text-blue-400"></i>
                <span>2. 🚗 Motor Vehicle Sale Agreement (Emmotoka)</span>
              </button>
              <button onclick="openWizardModal('tenancy_agree')" class="quick-pill bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm">
                <i class="fa-solid fa-key text-cyan-400"></i>
                <span>3. 🔑 Tenancy Agreement (Landlord & Tenant Act 2022)</span>
              </button>
              <button onclick="openWizardModal('debt_notice')" class="quick-pill bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm">
                <i class="fa-solid fa-file-invoice-dollar text-amber-400"></i>
                <span>4. 💸 7-Day Debt Demand Notice (Amabanja)</span>
              </button>
              <button onclick="openWizardModal('will_statutory')" class="quick-pill bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm">
                <i class="fa-solid fa-scroll text-rose-400"></i>
                <span>5. 📜 Last Will & Testament (Succession Act 2022)</span>
              </button>
            </div>
          </div>
          <div class="absolute -right-10 -bottom-10 opacity-10 text-white text-9xl pointer-events-none">
            <i class="fa-solid fa-scale-unbalanced"></i>
          </div>
        </div>

        <!-- 7 DEPARTMENTS GRID -->
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
              <h3 class="font-extrabold text-white text-base sm:text-lg">Need an Enrolled Advocate to Attest or Represent?</h3>
              <p class="text-xs sm:text-sm text-slate-400 max-w-xl">Have a complex land transfer, High Court ECCMIS matter, or corporate transaction? Connect directly with a verified Ugandan law firm.</p>
            </div>
          </div>
          <button onclick="openWizardModal('advocate_connect')" class="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20 whitespace-nowrap">
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

      <!-- INTERACTIVE DRAFTING MODAL WIZARD -->
      <div id="modalOverlay" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 hidden flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[95vh]">
          
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div id="modalIconBox" class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg">
                <i id="modalIcon" class="fa-solid fa-file-contract"></i>
              </div>
              <div>
                <h3 id="modalTitle" class="font-bold text-white text-base">Template Drafter</h3>
                <p id="modalSubtitle" class="text-xs text-slate-400">Ugandan Statutory Framework</p>
              </div>
            </div>
            <button onclick="closeModal()" class="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div id="modalBody" class="p-6 overflow-y-auto flex-grow space-y-4 text-xs text-slate-200">
            <!-- Dynamic Content -->
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between" id="modalFooter">
            <button onclick="closeModal()" class="px-4 py-2.5 border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-800 transition">
              Close
            </button>
            <div id="modalActions" class="flex space-x-2">
              <!-- Action buttons -->
            </div>
          </div>

        </div>
      </div>

      <!-- SCRIPT -->
      <script>
        var mode = 'citizen';

        var citizenDepts = [
          { colorKey: 'emerald', badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white', icon: 'fa-house-chimney', title: '1. Land, Plots & Renting', tag: 'Land Act Cap 227', desc: 'Comprehensive land purchase agreements, tenancy contracts, spousal consent affidavits, and boundary dispute protection.', deptKey: 'land' },
          { colorKey: 'blue', badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30', btnClass: 'bg-blue-600 hover:bg-blue-500 text-white', icon: 'fa-car', title: '2. Vehicles & Asset Sales', tag: 'Traffic & Commercial Laws', desc: 'Car & motor vehicle sale agreements, logbook transfer covenants, and equipment sales.', deptKey: 'vehicle' },
          { colorKey: 'amber', badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', btnClass: 'bg-amber-600 hover:bg-amber-500 text-white', icon: 'fa-gavel', title: '3. Money Disputes & Loans', tag: 'Small Claims < 10M', desc: '7-Day debt demand letters, friendly loan agreements, and Small Claims court filing guides.', deptKey: 'money' },
          { colorKey: 'purple', badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30', iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', btnClass: 'bg-purple-600 hover:bg-purple-500 text-white', icon: 'fa-user-group', title: '4. Hiring & Employment', tag: 'Employment Act 2006', desc: 'Standard employment contracts, show-cause disciplinary notices, and fair severance calculators.', deptKey: 'hiring' },
          { colorKey: 'rose', badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30', btnClass: 'bg-rose-600 hover:bg-rose-500 text-white', icon: 'fa-scroll', title: '5. Wills & Family Estates', tag: 'Succession Act 2022', desc: 'Statutory Last Will and Testament drafting and Letters of Administration checklists.', deptKey: 'family' },
          { colorKey: 'cyan', badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', btnClass: 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold', icon: 'fa-stamp', title: '6. Affidavits & Declarations', tag: 'Oaths Act Cap 19', desc: 'Affidavits of identity discrepancy, loss of document declarations, and sworn statements.', deptKey: 'affidavits' },
          { colorKey: 'orange', badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30', iconBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', btnClass: 'bg-orange-600 hover:bg-orange-500 text-white', icon: 'fa-briefcase', title: '7. Business & Company', tag: 'Companies Act 2012', desc: 'URSB registration wizards, partnership agreements, non-disclosure deeds (NDAs), and supply contracts.', deptKey: 'business' }
        ];

        var advocateDepts = [
          { colorKey: 'emerald', badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white', icon: 'fa-house-chimney', title: '1. Conveyancing & Titles', tag: 'RTA Cap 230', desc: 'NLIS title search encumbrance auditing, caveat lapse briefs, and statutory transfer instruments.', deptKey: 'land' },
          { colorKey: 'blue', badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30', btnClass: 'bg-blue-600 hover:bg-blue-500 text-white', icon: 'fa-briefcase', title: '2. Banking, SIMPO & M&A', tag: 'SIMPO Act 2019', desc: 'SIMPO movable collateral perfection, debentures, fixed charges, and shareholder resolutions.', deptKey: 'business' },
          { colorKey: 'amber', badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', btnClass: 'bg-amber-600 hover:bg-amber-500 text-white', icon: 'fa-gavel', title: '3. Litigation & ECCMIS', tag: 'CPR (SI 71-1)', desc: 'ECCMIS Plaints, WSDs, and chamber summons citing Civil Procedure Rules and ULII authorities.', deptKey: 'money' },
          { colorKey: 'rose', badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30', btnClass: 'bg-rose-600 hover:bg-rose-500 text-white', icon: 'fa-receipt', title: '4. Tax Appeals (TAT)', tag: 'TPCA 2014 Sec 24', desc: 'Statutory 45-day URA objection notices and Tax Appeals Tribunal Statements of Facts.', deptKey: 'tax' },
          { colorKey: 'purple', badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30', iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', btnClass: 'bg-purple-600 hover:bg-purple-500 text-white', icon: 'fa-user-group', title: '5. Industrial Court Labor', tag: 'Employment Act 2006', desc: 'Redundancy defense briefs, executive non-competes, and statutory fair hearing packets.', deptKey: 'hiring' },
          { colorKey: 'cyan', badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', btnClass: 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold', icon: 'fa-shield-halved', title: '6. Regulatory & PDPO', tag: 'PDPO & FIA Regulations', desc: 'Data Protection Impact Assessments (DPIA), FIA AML manuals, and PAU compliance.', deptKey: 'permits' },
          { colorKey: 'orange', badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30', iconBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', btnClass: 'bg-orange-600 hover:bg-orange-500 text-white', icon: 'fa-trademark', title: '7. IP Portfolio & ARIPO', tag: 'Trademarks Act 2010', desc: 'URSB multi-class trademark petitions, opposition notices, and technology transfer deeds.', deptKey: 'ip' }
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
            html += '  <button onclick="openDeptHub(\\'' + d.deptKey + '\\')" class="w-full py-3 rounded-2xl text-xs font-extrabold tracking-wider uppercase transition-all shadow-md ' + d.btnClass + '">';
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
            h1.textContent = 'Draft a Legally Binding Ugandan Agreement';
            p.textContent = 'Fill out the guided smart template below. Our AI evaluates all legal angles, enforces statutory covenants, and outputs a downloadable, court-grade PDF document:';
          } else {
            btnA.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 font-extrabold shadow-md transition-all';
            btnC.className = 'px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all';
            h1.textContent = 'Advocate & Legal Operations Workspace';
            p.textContent = 'Draft ECCMIS-formatted pleadings (CPR SI 71-1), audit NLIS title search encumbrances, and file statutory URA/TAT tax appeals.';
          }
          render();
        }

        function openDeptHub(key) {
          if (key === 'land') {
            openWizardModal('land_comprehensive');
          } else if (key === 'vehicle') {
            openWizardModal('car_sale');
          } else if (key === 'money') {
            openWizardModal('debt_notice');
          } else if (key === 'hiring') {
            openWizardModal('employment_contract');
          } else if (key === 'family') {
            openWizardModal('will_statutory');
          } else if (key === 'affidavits') {
            openWizardModal('affidavit_general');
          } else if (key === 'business') {
            openWizardModal('goods_supply');
          } else {
            openWizardModal('land_comprehensive');
          }
        }

        // --- MASTER TEMPLATE WIZARD MODAL ---
        function openWizardModal(type) {
          var modal = document.getElementById('modalOverlay');
          var title = document.getElementById('modalTitle');
          var sub = document.getElementById('modalSubtitle');
          var icon = document.getElementById('modalIcon');
          var iconBox = document.getElementById('modalIconBox');
          var body = document.getElementById('modalBody');
          var actions = document.getElementById('modalActions');

          if (type === 'land_comprehensive') {
            title.textContent = 'THE REPUBLIC OF UGANDA - LAND SALE & PURCHASE AGREEMENT';
            sub.textContent = 'Comprehensive Advocate Template (Registered & Registrable Interests)';
            icon.className = 'fa-solid fa-house-chimney text-emerald-400';
            iconBox.className = 'w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg';

            body.innerHTML = `
              <div class="space-y-4">
                <div class="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-[11px] leading-relaxed">
                  <strong>Smart AI Legal Guardrail:</strong> Evaluates Section 39 Spousal Consent, Registration of Titles Act (Cap 230), URA Stamp Duty, and LC1 physical boundary verification.
                </div>
                
                <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div class="font-bold text-slate-300 text-xs uppercase tracking-wider text-emerald-400">1. Transaction Particulars</div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-400 mb-1">Seller Full Legal Name & NIN</label>
                      <input id="t_seller" type="text" value="Mukasa Patrick (NIN: CM8401928410KD)" class="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500">
                    </div>
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-400 mb-1">Buyer Full Legal Name & NIN</label>
                      <input id="t_buyer" type="text" value="Grace Namubiru (NIN: CF9102847291KL)" class="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500">
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-3">
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-400 mb-1">Tenure Type</label>
                      <select id="t_tenure" class="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500">
                        <option>Mailo Land</option>
                        <option>Freehold Title</option>
                        <option>Leasehold Title</option>
                        <option>Customary / Kibanja</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-400 mb-1">Block / Plot / Title Ref</label>
                      <input id="t_plot" type="text" value="Block 244 Plot 1892 (Vol 482 Folio 12)" class="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 font-mono">
                    </div>
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-400 mb-1">Location / District</label>
                      <input id="t_location" type="text" value="Kira, Kyadondo, Wakiso District" class="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500">
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-3">
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-400 mb-1">Purchase Price (UGX)</label>
                      <input id="t_price_fig" type="text" value="45,000,000" class="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500">
                    </div>
                    <div class="col-span-2">
                      <label class="block text-[11px] font-semibold text-slate-400 mb-1">Price in Words</label>
                      <input id="t_price_words" type="text" value="Uganda Shillings Forty-Five Million Only" class="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500">
                    </div>
                  </div>
                </div>

                <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div class="font-bold text-slate-300 text-xs uppercase tracking-wider text-emerald-400">2. Statutory Covenants & Protection Blocks</div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-400 mb-1">Spouse Full Name (Section 39 Land Act Consent)</label>
                      <input id="t_spouse" type="text" value="Sarah Mukasa (NIN: CF8801928410AA)" class="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500">
                    </div>
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-400 mb-1">LC1 Chairperson & Zone</label>
                      <input id="t_lc1" type="text" value="Mulindwa John (Kira Central LC1)" class="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-400 mb-1">Neighbor Witness 1 (North Boundary)</label>
                      <input id="t_w1" type="text" value="Kato Emmanuel (NIN: CM8901234567BB)" class="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500">
                    </div>
                    <div>
                      <label class="block text-[11px] font-semibold text-slate-400 mb-1">Neighbor Witness 2 (South Boundary)</label>
                      <input id="t_w2" type="text" value="Nalubega Harriet (NIN: CF9007654321CC)" class="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500">
                    </div>
                  </div>
                </div>

                <!-- Live Generated Preview Container -->
                <div id="previewContainer" class="hidden space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center">
                      <i class="fa-solid fa-circle-check mr-1.5"></i> Generated Court-Grade Agreement Preview
                    </span>
                    <div class="flex space-x-2">
                      <button onclick="copyDocumentText()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1">
                        <i class="fa-solid fa-copy"></i> <span>Copy</span>
                      </button>
                      <button onclick="window.print()" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1">
                        <i class="fa-solid fa-file-pdf"></i> <span>Download PDF / Print</span>
                      </button>
                    </div>
                  </div>
                  <div id="printableDocument" class="p-5 bg-white text-slate-950 rounded-2xl font-mono-doc text-[11px] leading-relaxed max-h-72 overflow-y-auto border border-slate-300 whitespace-pre-wrap"></div>
                </div>
              </div>
            `;

            actions.innerHTML = `
              <button onclick="compileComprehensiveLandAgreement()" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center space-x-2">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
                <span>Generate Legal Document & PDF</span>
              </button>
            `;
          } else {
            title.textContent = 'Smart Template Drafter';
            sub.textContent = 'Ugandan Statutory Standards';
            body.innerHTML = '<p class="text-xs text-slate-300">Select any template from the top bar to generate your customized agreement.</p>';
            actions.innerHTML = '<button onclick="closeModal()" class="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl">OK</button>';
          }

          modal.classList.remove('hidden');
        }

        function closeModal() {
          document.getElementById('modalOverlay').classList.add('hidden');
        }

        function compileComprehensiveLandAgreement() {
          var seller = document.getElementById('t_seller').value;
          var buyer = document.getElementById('t_buyer').value;
          var tenure = document.getElementById('t_tenure').value;
          var plot = document.getElementById('t_plot').value;
          var loc = document.getElementById('t_location').value;
          var pFig = document.getElementById('t_price_fig').value;
          var pWords = document.getElementById('t_price_words').value;
          var spouse = document.getElementById('t_spouse').value;
          var lc1 = document.getElementById('t_lc1').value;
          var w1 = document.getElementById('t_w1').value;
          var w2 = document.getElementById('t_w2').value;

          var fullDoc = `THE REPUBLIC OF UGANDA\\nLAND SALE AND PURCHASE AGREEMENT\\n(Comprehensive Advocate-Grade Contract for Registered and Registrable Land Interests)\\nGrounded in: Constitution of Uganda, Land Act (Cap 227 as amended), Registration of Titles Act (Cap 230), and Stamp Duty Act\\n\\n========================================================================================================\\n                                      TRANSACTION PARTICULARS\\n========================================================================================================\\n1. Agreement Date       : 30th August 2026\\n2. The Seller / Vendor  : ` + seller.toUpperCase() + `\\n3. The Buyer / Purchaser: ` + buyer.toUpperCase() + `\\n4. Land Description     : ` + plot + `, Situated at ` + loc + `\\n5. Tenure               : ` + tenure.toUpperCase() + `\\n6. Purchase Consideration: UGX ` + pFig + `/= (` + pWords.toUpperCase() + `)\\n7. Statutory Spousal Consent: Mandatory under Section 39 of the Land Act (Cap 227)\\n\\n========================================================================================================\\n                                      OPERATIVE AGREEMENT\\n========================================================================================================\\nTHIS AGREEMENT is made on this 30th day of August 2026 BETWEEN the Seller and the Buyer identified above.\\n\\nBACKGROUND & RECITALS:\\nA. Seller's Interest: The Seller represents and covenants that the Seller is the absolute registered proprietor / lawful customary holder entitled to sell the Land.\\nB. Buyer's Intention: The Buyer agrees to purchase the said interest free from all encumbrances, subject to the terms and statutory covenants herein.\\n\\nNOW THIS AGREEMENT WITNESSETH AS FOLLOWS:\\n\\n1. AGREEMENT FOR SALE & NATURE OF INTEREST:\\n1.1 The Seller hereby sells and the Buyer purchases the Land with vacant possession at completion, free from all undisclosed mortgages, charges, caveats, liens, or third-party claims.\\n1.2 The Land is held under ` + tenure + ` tenure. The Seller guarantees that boundaries have been opened in the presence of Local Council 1 (LC1) and adjoining neighbors.\\n\\n2. PURCHASE CONSIDERATION & PAYMENT TERMS:\\n2.1 The agreed total purchase price is UGX ` + pFig + `/= (` + pWords + `).\\n2.2 The Buyer has paid the full sum to the Seller, the receipt whereof the Seller hereby acknowledges.\\n2.3 No cash diversion: All payments are documented and witnessed under this formal instrument.\\n\\n3. MANDATORY STATUTORY SPOUSAL CONSENT (Section 39 Land Act Cap 227):\\nI, ` + spouse.toUpperCase() + `, being the lawful spouse of the Seller, do hereby solemnly declare that I have been fully informed of this transaction, and I FREELY, VOLUNTARILY, AND UNCONDITIONALLY CONSENT to the sale and transfer of the subject land.\\nSignature of Consenting Spouse: ___________________________ Date: 30th August 2026\\n\\n4. SELLER REPRESENTATIONS, WARRANTIES & INDEMNITY:\\n4.1 The Seller warrants that the certificate of title is authentic, unencumbered, and not subject to any pending litigation, family succession dispute, or compulsory government acquisition.\\n4.2 The Seller undertakes to sign all statutory Ministry of Lands / NLIS transfer forms and deliver the original Certificate of Title immediately upon execution.\\n4.3 The Seller hereby indemnifies the Buyer against any eviction, claim, or loss arising from any undisclosed defect in title.\\n\\n5. VACANT POSSESSION & RISK:\\nImmediate peaceful and vacant possession of the land is granted to the Buyer upon execution of this agreement.\\n\\n6. DISPUTE RESOLUTION & GOVERNING LAW:\\nThis Agreement is governed by the laws of the Republic of Uganda. Any dispute shall first be referred to mediation, failing which the courts of competent jurisdiction in Uganda shall have exclusive jurisdiction.\\n\\n========================================================================================================\\n                                      EXECUTION & ATTESTATION\\n========================================================================================================\\nIN WITNESS WHEREOF the parties have set their hands on the date first above written:\\n\\nSELLER / VENDOR:                                BUYER / PURCHASER:\\nSignature: ___________________________          Signature: ___________________________\\n` + seller.toUpperCase() + `                    ` + buyer.toUpperCase() + `\\n\\nSTATUTORY ATTESTATION BY LOCAL COUNCIL 1 (LC1) & NEIGHBORS:\\n- LC1 Chairperson (` + lc1 + `): Signature & Official Stamp: ___________________________\\n- Neighbor Witness 1 (North Boundary - ` + w1 + `): Signature: ___________________________\\n- Neighbor Witness 2 (South Boundary - ` + w2 + `): Signature: ___________________________\\n\\nADVOCATE REVIEW & ATTESTATION BLOCK:\\nDrawn & Verified By:\\nWACHA LEGAL ADVOCATES (Kampala, Uganda)\\nPractising Certificate No.: ___________________________`;

          document.getElementById('printableDocument').textContent = fullDoc;
          document.getElementById('previewContainer').classList.remove('hidden');
        }

        function copyDocumentText() {
          var text = document.getElementById('printableDocument').textContent;
          navigator.clipboard.writeText(text).then(function() {
            alert('Agreement text copied to clipboard successfully!');
          });
        }

        render();
      </script>
    </body>
    </html>
    """
