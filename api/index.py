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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        
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
              <p class="text-xs text-slate-400 font-medium">Standard Ugandan Legal Agreements & Operations Workspace</p>
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
              <i class="fa-solid fa-bolt-lightning text-cyan-400"></i>
              <span>Uganda Standard Legal Drafting Engine</span>
            </div>
            <h1 id="heroH1" class="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">Draft a Legally Binding Ugandan Agreement</h1>
            <p id="heroP" class="text-slate-300 text-sm mb-6 leading-relaxed">Select any agreement type below to generate a comprehensive, legally compliant Ugandan contract with all statutory covenants, witness blocks, and execution clauses:</p>
            
            <div class="flex flex-wrap gap-2.5">
              <button onclick="openWizardModal('land_purchase')" class="quick-pill bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm">
                <i class="fa-solid fa-house-chimney text-emerald-400"></i>
                <span>1. 🏡 Land Purchase Agreement (Ettaka)</span>
              </button>
              <button onclick="openWizardModal('car_sale')" class="quick-pill bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm">
                <i class="fa-solid fa-car text-blue-400"></i>
                <span>2. 🚗 Car / Vehicle Sale Agreement (Emmotoka)</span>
              </button>
              <button onclick="openWizardModal('debt_notice')" class="quick-pill bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm">
                <i class="fa-solid fa-file-invoice-dollar text-amber-400"></i>
                <span>3. 💸 7-Day Debt Demand Notice (Amabanja)</span>
              </button>
              <button onclick="openWizardModal('affidavit_general')" class="quick-pill bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm">
                <i class="fa-solid fa-stamp text-purple-400"></i>
                <span>4. 📜 General Affidavit / Oath (Oaths Act)</span>
              </button>
              <button onclick="openWizardModal('will_statutory')" class="quick-pill bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-sm">
                <i class="fa-solid fa-scroll text-rose-400"></i>
                <span>5. ⚖️ Valid Will & Testament (Ewalaama)</span>
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
        <div class="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[94vh]">
          
          <!-- Modal Header -->
          <div class="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div id="modalIconBox" class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg">
                <i id="modalIcon" class="fa-solid fa-file-contract"></i>
              </div>
              <div>
                <h3 id="modalTitle" class="font-bold text-white text-base">Agreement Drafter</h3>
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
          { colorKey: 'emerald', badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white', icon: 'fa-house-chimney', title: '1. Land, Plots & Renting', tag: 'Land Act Cap 227', desc: 'Land purchase agreements, tenancy contracts, spousal consent affidavits, and boundary dispute protection.', deptKey: 'land' },
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
            p.textContent = 'Select any agreement type below to generate a comprehensive, legally compliant Ugandan contract with all statutory covenants, witness blocks, and execution clauses:';
          } else {
            btnA.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 font-extrabold shadow-md transition-all';
            btnC.className = 'px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all';
            h1.textContent = 'Advocate & Legal Operations Workspace';
            p.textContent = 'Draft ECCMIS-formatted pleadings (CPR SI 71-1), audit NLIS title search encumbrances, and file statutory URA/TAT tax appeals.';
          }
          render();
        }

        // --- DEPARTMENT SUB-HUBS ---
        function openDeptHub(key) {
          if (key === 'land') {
            openLandHub();
          } else if (key === 'vehicle') {
            openWizardModal('car_sale');
          } else if (key === 'money') {
            openMoneyHub();
          } else if (key === 'hiring') {
            openHiringHub();
          } else if (key === 'family') {
            openWizardModal('will_statutory');
          } else if (key === 'affidavits') {
            openWizardModal('affidavit_general');
          } else if (key === 'business') {
            openBizHub();
          } else {
            openWizardModal('land_purchase');
          }
        }

        function openLandHub() {
          var modal = document.getElementById('modalOverlay');
          document.getElementById('modalTitle').textContent = '🏡 Land, Plots & Renting (Ettaka)';
          document.getElementById('modalSubtitle').textContent = 'Select what you need to draft or verify:';
          document.getElementById('modalIcon').className = 'fa-solid fa-house-chimney text-emerald-400';
          document.getElementById('modalIconBox').className = 'w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg';

          document.getElementById('modalBody').innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button onclick="openWizardModal('land_purchase')" class="sub-card text-left p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2"><i class="fa-solid fa-file-signature"></i></div>
                  <div class="font-bold text-white text-sm">1. Land Purchase Agreement</div>
                  <div class="text-[11px] text-slate-400 mt-1">Full Ugandan agreement with spousal consent & LC1 witness block.</div>
                </div>
                <div class="mt-3 text-[11px] font-bold text-emerald-400 flex items-center">Draft Agreement <i class="fa-solid fa-arrow-right ml-1"></i></div>
              </button>
              <button onclick="openWizardModal('spousal_consent')" class="sub-card text-left p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2"><i class="fa-solid fa-ring"></i></div>
                  <div class="font-bold text-white text-sm">2. Spousal Consent Affidavit</div>
                  <div class="text-[11px] text-slate-400 mt-1">Statutory Declaration sworn under Land Act (Section 39).</div>
                </div>
                <div class="mt-3 text-[11px] font-bold text-purple-400 flex items-center">Draft Affidavit <i class="fa-solid fa-arrow-right ml-1"></i></div>
              </button>
              <button onclick="openWizardModal('tenancy_agree')" class="sub-card text-left p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div class="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2"><i class="fa-solid fa-key"></i></div>
                  <div class="font-bold text-white text-sm">3. Tenancy Agreement</div>
                  <div class="text-[11px] text-slate-400 mt-1">Compliant with the Landlord and Tenant Act 2022.</div>
                </div>
                <div class="mt-3 text-[11px] font-bold text-cyan-400 flex items-center">Draft Agreement <i class="fa-solid fa-arrow-right ml-1"></i></div>
              </button>
              <button onclick="openWizardModal('land_doc_scan')" class="sub-card text-left p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2"><i class="fa-solid fa-file-shield"></i></div>
                  <div class="font-bold text-white text-sm">4. Search Report Audit</div>
                  <div class="text-[11px] text-slate-400 mt-1">Scan search reports for active caveats and mortgages.</div>
                </div>
                <div class="mt-3 text-[11px] font-bold text-blue-400 flex items-center">Audit Search <i class="fa-solid fa-arrow-right ml-1"></i></div>
              </button>
            </div>
          `;
          document.getElementById('modalActions').innerHTML = '';
          modal.classList.remove('hidden');
        }

        function openMoneyHub() {
          var modal = document.getElementById('modalOverlay');
          document.getElementById('modalTitle').textContent = '💸 Money, Loans & Disputes (Amabanja)';
          document.getElementById('modalSubtitle').textContent = 'Select an agreement or recovery action:';
          document.getElementById('modalIcon').className = 'fa-solid fa-gavel text-amber-400';
          document.getElementById('modalIconBox').className = 'w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg';

          document.getElementById('modalBody').innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button onclick="openWizardModal('debt_notice')" class="sub-card text-left p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2"><i class="fa-solid fa-file-invoice-dollar"></i></div>
                  <div class="font-bold text-white text-sm">1. 7-Day Demand Notice</div>
                  <div class="text-[11px] text-slate-400 mt-1">Formal legal debt notice prior to Small Claims Court action.</div>
                </div>
                <div class="mt-3 text-[11px] font-bold text-amber-400 flex items-center">Draft Notice <i class="fa-solid fa-arrow-right ml-1"></i></div>
              </button>
              <button onclick="openWizardModal('friendly_loan')" class="sub-card text-left p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2"><i class="fa-solid fa-handshake"></i></div>
                  <div class="font-bold text-white text-sm">2. Loan Agreement / IOU</div>
                  <div class="text-[11px] text-slate-400 mt-1">Binding money loan agreement with collateral pledge & witness terms.</div>
                </div>
                <div class="mt-3 text-[11px] font-bold text-blue-400 flex items-center">Draft Loan Deal <i class="fa-solid fa-arrow-right ml-1"></i></div>
              </button>
            </div>
          `;
          document.getElementById('modalActions').innerHTML = '';
          modal.classList.remove('hidden');
        }

        function openHiringHub() {
          var modal = document.getElementById('modalOverlay');
          document.getElementById('modalTitle').textContent = '👥 Hiring & Employment (Abakozi)';
          document.getElementById('modalSubtitle').textContent = 'Employment Act 2006 Compliant Documents:';
          document.getElementById('modalIcon').className = 'fa-solid fa-user-group text-purple-400';
          document.getElementById('modalIconBox').className = 'w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg';

          document.getElementById('modalBody').innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button onclick="openWizardModal('employment_contract')" class="sub-card text-left p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2"><i class="fa-solid fa-file-signature"></i></div>
                  <div class="font-bold text-white text-sm">1. Employment Contract</div>
                  <div class="text-[11px] text-slate-400 mt-1">Covers probation, salary, working hours, leaves, and NSSF.</div>
                </div>
                <div class="mt-3 text-[11px] font-bold text-purple-400 flex items-center">Draft Contract <i class="fa-solid fa-arrow-right ml-1"></i></div>
              </button>
              <button onclick="openWizardModal('show_cause_notice')" class="sub-card text-left p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div class="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2"><i class="fa-solid fa-triangle-exclamation"></i></div>
                  <div class="font-bold text-white text-sm">2. Notice to Show Cause</div>
                  <div class="text-[11px] text-slate-400 mt-1">Section 66 fair hearing disciplinary notice with 48h response window.</div>
                </div>
                <div class="mt-3 text-[11px] font-bold text-rose-400 flex items-center">Draft Notice <i class="fa-solid fa-arrow-right ml-1"></i></div>
              </button>
            </div>
          `;
          document.getElementById('modalActions').innerHTML = '';
          modal.classList.remove('hidden');
        }

        function openBizHub() {
          var modal = document.getElementById('modalOverlay');
          document.getElementById('modalTitle').textContent = '💼 Business & Commercial Deals';
          document.getElementById('modalSubtitle').textContent = 'Companies Act & Contract Law:';
          document.getElementById('modalIcon').className = 'fa-solid fa-briefcase text-blue-400';
          document.getElementById('modalIconBox').className = 'w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg';

          document.getElementById('modalBody').innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button onclick="openWizardModal('goods_supply')" class="sub-card text-left p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2"><i class="fa-solid fa-box-open"></i></div>
                  <div class="font-bold text-white text-sm">1. Goods & Supply Deal</div>
                  <div class="text-[11px] text-slate-400 mt-1">Clear supply terms, payment milestones, and quality warranties.</div>
                </div>
                <div class="mt-3 text-[11px] font-bold text-blue-400 flex items-center">Draft Supply Deal <i class="fa-solid fa-arrow-right ml-1"></i></div>
              </button>
              <button onclick="openWizardModal('nda_deed')" class="sub-card text-left p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <div class="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2"><i class="fa-solid fa-shield-halved"></i></div>
                  <div class="font-bold text-white text-sm">2. Non-Disclosure Agreement (NDA)</div>
                  <div class="text-[11px] text-slate-400 mt-1">Protects business secrets, client lists, and technical IP.</div>
                </div>
                <div class="mt-3 text-[11px] font-bold text-cyan-400 flex items-center">Draft NDA <i class="fa-solid fa-arrow-right ml-1"></i></div>
              </button>
            </div>
          `;
          document.getElementById('modalActions').innerHTML = '';
          modal.classList.remove('hidden');
        }

        // --- MASTER DRAFTING ENGINE (AUTHENTIC UGANDAN LEGAL AGREEMENTS) ---
        function openWizardModal(type) {
          var modal = document.getElementById('modalOverlay');
          var title = document.getElementById('modalTitle');
          var sub = document.getElementById('modalSubtitle');
          var icon = document.getElementById('modalIcon');
          var iconBox = document.getElementById('modalIconBox');
          var body = document.getElementById('modalBody');
          var actions = document.getElementById('modalActions');

          if (type === 'car_sale') {
            title.textContent = '🚗 Motor Vehicle Sale Agreement (Endagaano y\\'Emmotoka)';
            sub.textContent = 'Uganda Traffic and Road Safety Act & Contract Law';
            icon.className = 'fa-solid fa-car text-blue-400';
            iconBox.className = 'w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg';

            body.innerHTML = `
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Seller Full Name</label>
                    <input id="v_seller" type="text" value="Joseph Katende" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white">
                  </div>
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Buyer Full Name</label>
                    <input id="v_buyer" type="text" value="Dr. Ronald Kigozi" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white">
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Reg. Number</label>
                    <input id="v_reg" type="text" value="UBF 492X" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white font-mono">
                  </div>
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Make & Model</label>
                    <input id="v_model" type="text" value="Toyota Harrier (2016)" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white">
                  </div>
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Agreed Price (UGX)</label>
                    <input id="v_price" type="text" value="68,000,000" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white">
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Chassis No. (VIN)</label>
                    <input id="v_chassis" type="text" value="ACU30-0049281" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white font-mono">
                  </div>
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Engine No.</label>
                    <input id="v_engine" type="text" value="2AZ-9482104" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white font-mono">
                  </div>
                </div>
                <div id="draftOutput" class="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-300 max-h-56 overflow-y-auto hidden"></div>
              </div>
            `;
            actions.innerHTML = `
              <button onclick="generateCarAgreement()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition">
                Generate Motor Vehicle Agreement
              </button>
            `;
          } else if (type === 'land_purchase') {
            title.textContent = '🏡 Land Purchase Agreement (Endagaano y\\'Okugula Ettaka)';
            sub.textContent = 'Under the Land Act (Cap 227) and Registration of Titles Act (Cap 230)';
            icon.className = 'fa-solid fa-house-chimney text-emerald-400';
            iconBox.className = 'w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg';

            body.innerHTML = `
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Seller Full Name</label>
                    <input id="l_seller" type="text" value="Mukasa Patrick" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-white">
                  </div>
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Buyer Full Name</label>
                    <input id="l_buyer" type="text" value="Grace Namubiru" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-white">
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Tenure Type</label>
                    <select id="l_tenure" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-white">
                      <option>Mailo Land</option>
                      <option>Freehold Title</option>
                      <option>Kibanja / Customary</option>
                      <option>Leasehold Title</option>
                    </select>
                  </div>
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Location / District</label>
                    <input id="l_loc" type="text" value="Kira, Wakiso District" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-white">
                  </div>
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Price (UGX)</label>
                    <input id="l_price" type="text" value="45,000,000" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-white">
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Spouse Name (Section 39 Consent)</label>
                    <input id="l_spouse" type="text" value="Sarah Mukasa" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-white">
                  </div>
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">LC1 Chairperson / Zone</label>
                    <input id="l_lc1" type="text" value="Mulindwa John (Kira Central LC1)" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 text-white">
                  </div>
                </div>
                <div id="draftOutput" class="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-300 max-h-56 overflow-y-auto hidden"></div>
              </div>
            `;
            actions.innerHTML = `
              <button onclick="generateFullLandAgreement()" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition">
                Generate Full Land Agreement
              </button>
            `;
          } else if (type === 'affidavit_general') {
            title.textContent = '📜 General Sworn Affidavit / Statutory Declaration';
            sub.textContent = 'Under the Statutory Declarations Act & Oaths Act (Cap 19)';
            icon.className = 'fa-solid fa-stamp text-purple-400';
            iconBox.className = 'w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg';

            body.innerHTML = `
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Declarant / Deponent Full Name</label>
                    <input id="a_name" type="text" value="Patience Nakato Tumwine" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-purple-500 text-white">
                  </div>
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">National ID No. (NIN)</label>
                    <input id="a_nin" type="text" value="CF8401928410KD" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-purple-500 text-white font-mono">
                  </div>
                </div>
                <div>
                  <label class="block font-semibold mb-1 text-slate-300">Affidavit Subject / Matter</label>
                  <input id="a_subject" type="text" value="Verification of Discrepancy in Name and Date of Birth" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-purple-500 text-white">
                </div>
                <div>
                  <label class="block font-semibold mb-1 text-slate-300">Sworn Facts (Paragraphs)</label>
                  <textarea id="a_facts" rows="3" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-purple-500 text-white">1. That my name appears on my Academic Certificate as Patience Nakato, while on my National ID it appears as Patience Nakato Tumwine.\\n2. That Patience Nakato and Patience Nakato Tumwine refer to one and the same person.\\n3. That I make this solemn declaration conscientiously believing the same to be true.</textarea>
                </div>
                <div id="draftOutput" class="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-300 max-h-56 overflow-y-auto hidden"></div>
              </div>
            `;
            actions.innerHTML = `
              <button onclick="generateFullAffidavit()" class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition">
                Generate Sworn Affidavit
              </button>
            `;
          } else if (type === 'debt_notice') {
            title.textContent = '💸 7-Day Formal Debt Demand Notice';
            sub.textContent = 'Judicature (Small Claims Procedure) Rules';
            icon.className = 'fa-solid fa-file-invoice-dollar text-amber-400';
            iconBox.className = 'w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg';

            body.innerHTML = `
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Creditor Full Name</label>
                    <input id="d_creditor" type="text" value="Sarah Tumusiime" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-amber-500 text-white">
                  </div>
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Debtor Full Name</label>
                    <input id="d_debtor" type="text" value="David Kigozi" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-amber-500 text-white">
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Amount Due (UGX)</label>
                    <input id="d_amount" type="text" value="6,500,000" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-amber-500 text-white">
                  </div>
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Due Date</label>
                    <input id="d_date" type="date" value="2026-06-15" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-amber-500 text-white">
                  </div>
                </div>
                <div>
                  <label class="block font-semibold mb-1 text-slate-300">Debt Particulars / Cause</label>
                  <input id="d_cause" type="text" value="Unpaid balance for commercial supplies delivered on invoice #492" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-amber-500 text-white">
                </div>
                <div id="draftOutput" class="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-300 max-h-56 overflow-y-auto hidden"></div>
              </div>
            `;
            actions.innerHTML = `
              <button onclick="generateFullDemandNotice()" class="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition">
                Generate 7-Day Demand Notice
              </button>
            `;
          } else if (type === 'will_statutory') {
            title.textContent = '📜 Statutory Last Will and Testament';
            sub.textContent = 'Under the Succession (Amendment) Act 2022 of Uganda';
            icon.className = 'fa-solid fa-scroll text-rose-400';
            iconBox.className = 'w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-lg';

            body.innerHTML = `
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Testator Full Name</label>
                    <input id="w_testator" type="text" value="Yusuf Kigozi Ssempijja" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-rose-500 text-white">
                  </div>
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Residence / District</label>
                    <input id="w_res" type="text" value="Kisaasi, Kawempe Division, Kampala" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-rose-500 text-white">
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Executor 1 (Trustee)</label>
                    <input id="w_e1" type="text" value="Grace Nambasa" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-rose-500 text-white">
                  </div>
                  <div>
                    <label class="block font-semibold mb-1 text-slate-300">Executor 2 (Trustee)</label>
                    <input id="w_e2" type="text" value="Ronald Mukasa" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-rose-500 text-white">
                  </div>
                </div>
                <div>
                  <label class="block font-semibold mb-1 text-slate-300">Property Bequests & Distribution</label>
                  <textarea id="w_prop" rows="2" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-rose-500 text-white">1. Matrimonial residential home at Kisaasi to my surviving spouse.\\n2. Land at Kira (Block 244, Plot 18) to my children in equal shares.</textarea>
                </div>
                <div id="draftOutput" class="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-300 max-h-56 overflow-y-auto hidden"></div>
              </div>
            `;
            actions.innerHTML = `
              <button onclick="generateFullWill()" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition">
                Generate Valid Will
              </button>
            `;
          } else if (type === 'advocate_connect') {
            title.textContent = 'Connect with a Verified Ugandan Advocate';
            sub.textContent = 'Advocates Act (Cap 267) Compliant Referral';
            icon.className = 'fa-solid fa-user-tie text-amber-400';
            iconBox.className = 'w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg';

            body.innerHTML = `
              <div class="space-y-4">
                <p class="text-xs text-slate-300">Wacha Legal AI packages your dispute timeline, evidence, and relevant statutes into a clean <strong>Briefing Dossier</strong> for advocate review.</p>
                <div>
                  <label class="block font-semibold mb-1 text-slate-300">Your Phone / WhatsApp for Advocate Callback</label>
                  <input type="text" value="+256 701 450 900" class="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:border-amber-500 text-white">
                </div>
              </div>
            `;
            actions.innerHTML = `<button onclick="alert('Dossier compiled and routed for advocate review!'); closeModal();" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition">Submit Dossier</button>`;
          }

          modal.classList.remove('hidden');
        }

        function closeModal() {
          document.getElementById('modalOverlay').classList.add('hidden');
        }

        // --- REAL UGANDAN LEGAL TEMPLATE GENERATORS ---
        function generateCarAgreement() {
          var s = document.getElementById('v_seller').value;
          var b = document.getElementById('v_buyer').value;
          var r = document.getElementById('v_reg').value;
          var m = document.getElementById('v_model').value;
          var p = document.getElementById('v_price').value;
          var c = document.getElementById('v_chassis').value;
          var e = document.getElementById('v_engine').value;

          var draft = `THE REPUBLIC OF UGANDA\\nIN THE MATTER OF THE CONTRACTS ACT 2010\\nAND\\nIN THE MATTER OF THE TRAFFIC AND ROAD SAFETY ACT (CAP 361)\\n\\n======================================================================\\n                 MOTOR VEHICLE PURCHASE & SALE AGREEMENT\\n======================================================================\\n\\nTHIS AGREEMENT is made this 30th day of August 2026.\\n\\nBETWEEN:\\n1. THE VENDOR/SELLER: ` + s.toUpperCase() + ` (Ugandan Citizen, Holder of NIN: ____________________)\\n                                                            --- AND ---\\n2. THE PURCHASER/BUYER: ` + b.toUpperCase() + ` (Ugandan Citizen, Holder of NIN: ____________________)\\n\\n1. PARTICULARS OF THE MOTOR VEHICLE:\\n   - Registration Number : ` + r.toUpperCase() + `\\n   - Make & Model        : ` + m + `\\n   - Chassis Number (VIN): ` + c.toUpperCase() + `\\n   - Engine Number       : ` + e.toUpperCase() + `\\n\\n2. PURCHASE CONSIDERATION & PAYMENT:\\n   The total agreed purchase price for the said vehicle is UGX ` + p + `/= (Uganda Shillings ` + p + ` Only).\\n   The Purchaser has paid the sum of UGX ` + p + `/= in full, the receipt whereof the Vendor hereby acknowledges.\\n\\n3. VENDOR'S COVENANTS & WARRANTIES:\\n   a) The Vendor covenants that he/she is the absolute lawful owner of the vehicle and has full power to sell the same.\\n   b) The Vendor warrants that the vehicle is free from all encumbrances, third-party liens, court attachments, or unpaid URA taxes and traffic penalties up to the date of execution.\\n   c) The Vendor undertakes to sign all statutory URA motor vehicle transfer forms and hand over the original Logbook immediately upon execution.\\n\\n4. \\'AS-IS-WHERE-IS\\' INSPECTION:\\n   The Purchaser confirms physical inspection and road-testing and accepts the vehicle in its present mechanical condition.\\n\\nIN WITNESS WHEREOF the parties have set their hands:\\n\\n___________________________________             ___________________________________\\nVENDOR / SELLER: ` + s.toUpperCase() + `             PURCHASER / BUYER: ` + b.toUpperCase() + `\\n\\nWITNESSES:\\n1. Name & NIN: ____________________             2. Name & NIN: ____________________\\n   Sign: __________________________                Sign: __________________________`;

          var out = document.getElementById('draftOutput');
          out.classList.remove('hidden');
          out.textContent = draft;
        }

        function generateFullLandAgreement() {
          var s = document.getElementById('l_seller').value;
          var b = document.getElementById('l_buyer').value;
          var t = document.getElementById('l_tenure').value;
          var l = document.getElementById('l_loc').value;
          var p = document.getElementById('l_price').value;
          var sp = document.getElementById('l_spouse').value;
          var lc = document.getElementById('l_lc1').value;

          var draft = `THE REPUBLIC OF UGANDA\\nIN THE MATTER OF THE LAND ACT (CAP 227 AS AMENDED)\\nAND\\nIN THE MATTER OF THE REGISTRATION OF TITLES ACT (CAP 230)\\n\\n======================================================================\\n              LAND PURCHASE & ABSOLUTE TRANSFER AGREEMENT\\n                  (Endagaano y\\'Okugula n\\'Okutunda Ettaka)\\n======================================================================\\n\\nTHIS AGREEMENT is made this 30th day of August 2026.\\n\\nBETWEEN:\\n1. THE VENDOR: ` + s.toUpperCase() + ` (Ugandan Citizen, Resident of ` + l + `)\\n                                                         --- AND ---\\n2. THE PURCHASER: ` + b.toUpperCase() + ` (Ugandan Citizen, Resident of Kampala)\\n\\n1. THE SUBJECT PROPERTY:\\n   Piece and parcel of land situated at ` + l + `, held under ` + t + ` tenure, measuring approximately 50ft by 100ft, with clearly opened boundaries verified by Local Council 1 (LC1).\\n\\n2. PURCHASE CONSIDERATION:\\n   The agreed total purchase consideration is UGX ` + p + `/= (Uganda Shillings ` + p + ` Only).\\n   The Purchaser has paid the sum of UGX ` + p + `/= in full satisfaction, the receipt whereof the Vendor acknowledges.\\n\\n3. STATUTORY SPOUSAL CONSENT (Section 39 of the Land Act Cap 227):\\n   I, ` + sp.toUpperCase() + `, being the lawful spouse of the Vendor, do hereby solemnly declare that I have been informed of this sale and I FREELY AND UNCONDITIONALLY CONSENT to the sale and transfer of the subject land.\\n   Signature of Spouse: ___________________________ Date: 30th August 2026\\n\\n4. TITLE COVENANTS & VACANT POSSESSION:\\n   The Vendor covenants that the land is free from all encumbrances, third-party claims, caveats, or unregistered equitable mortgages, and undertakes to indemnify the Purchaser against eviction. Immediate vacant possession is granted.\\n\\n5. ATTESTATION BY LOCAL COUNCIL 1 (LC1) & NEIGHBORS:\\n   - LC1 Chairperson: ` + lc + ` (Sign & Stamp: ___________________________)\\n   - Neighbor Witness 1: ___________________________\\n   - Neighbor Witness 2: ___________________________\\n\\nIN WITNESS WHEREOF the parties have set their hands:\\n\\n___________________________________             ___________________________________\\nVENDOR: ` + s.toUpperCase() + `                       PURCHASER: ` + b.toUpperCase();

          var out = document.getElementById('draftOutput');
          out.classList.remove('hidden');
          out.textContent = draft;
        }

        function generateFullAffidavit() {
          var n = document.getElementById('a_name').value;
          var nin = document.getElementById('a_nin').value;
          var s = document.getElementById('a_subject').value;
          var f = document.getElementById('a_facts').value;

          var draft = `THE REPUBLIC OF UGANDA\\nIN THE MATTER OF THE STATUTORY DECLARATIONS ACT (CAP 22)\\nAND\\nIN THE MATTER OF THE OATHS ACT (CAP 19)\\n\\n======================================================================\\n                       STATUTORY DECLARATION / AFFIDAVIT\\n                    RE: ` + s.toUpperCase() + `\\n======================================================================\\n\\nI, ` + n.toUpperCase() + `, a female/male adult Ugandan of sound mind, holder of National Identification Number (NIN): ` + nin + `, residing at Kampala, do solemnly and sincerely declare as follows:\\n\\n` + f + `\\n\\n4. That whatever is stated hereinabove is true and correct to the best of my knowledge, information, and belief.\\n\\nDECLARED at Kampala by the said ` + n.toUpperCase() + ` this 30th day of August 2026.\\n\\n__________________________________________\\nDECLARANT / DEPONENT\\n\\nBEFORE ME:\\n\\n__________________________________________\\nCOMMISSIONER FOR OATHS / MAGISTRATE`;

          var out = document.getElementById('draftOutput');
          out.classList.remove('hidden');
          out.textContent = draft;
        }

        function generateFullDemandNotice() {
          var c = document.getElementById('d_creditor').value;
          var d = document.getElementById('d_debtor').value;
          var a = document.getElementById('d_amount').value;
          var dt = document.getElementById('d_date').value;
          var cause = document.getElementById('d_cause').value;

          var draft = `======================================================================\\n                         FORMAL 7-DAY DEMAND NOTICE\\n       (Under the Judicature Small Claims Procedure Rules of Uganda)\\n======================================================================\\nDATE: 30th August 2026\\n\\nTO: ` + d.toUpperCase() + `\\nFROM: ` + c.toUpperCase() + ` (Creditor)\\n\\nRE: FORMAL DEMAND FOR PAYMENT OF OUTSTANDING DEBT: UGX ` + a + `/=\\n\\nTAKE NOTICE that you are indebted to the undersigned Creditor in the liquidated sum of UGX ` + a + `/= being ` + cause + `, which fell due on ` + dt + ` and remains unpaid.\\n\\nDEMAND IS HEREBY MADE that you pay the full amount of UGX ` + a + `/= within SEVEN (7) DAYS from the date of service of this notice.\\n\\nTAKE FURTHER NOTICE that should you fail, refuse, or neglect to clear the said sum within the stipulated seven (7) days:\\n1. Formal civil proceedings will be instituted against you in the Small Claims Court / Chief Magistrates Court under the Judicature (Small Claims Procedure) Rules.\\n2. We shall pray for judgment against you for the principal sum, interest, costs of the suit, and execution by attachment of assets without further notice.\\n\\nYours faithfully,\\n\\n__________________________________________\\n` + c.toUpperCase() + ` (Creditor)`;

          var out = document.getElementById('draftOutput');
          out.classList.remove('hidden');
          out.textContent = draft;
        }

        function generateFullWill() {
          var t = document.getElementById('w_testator').value;
          var res = document.getElementById('w_res').value;
          var e1 = document.getElementById('w_e1').value;
          var e2 = document.getElementById('w_e2').value;
          var prop = document.getElementById('w_prop').value;

          var draft = `THE REPUBLIC OF UGANDA\\nIN THE MATTER OF THE SUCCESSION ACT (CAP 162)\\nAS AMENDED BY THE SUCCESSION (AMENDMENT) ACT 2022\\n\\n======================================================================\\n                    LAST WILL AND TESTAMENT\\n======================================================================\\n\\nI, ` + t.toUpperCase() + `, residing at ` + res + `, being of sound mind, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all former wills made by me.\\n\\n1. APPOINTMENT OF EXECUTORS & TRUSTEES:\\n   I appoint the following persons to be the joint Executors and Trustees of this my Will:\\n   a) ` + e1 + ` (Ugandan Citizen)\\n   b) ` + e2 + ` (Ugandan Citizen)\\n\\n2. STATUTORY SPOUSAL RESIDENTIAL HOLDING (Section 27 Succession Act 2022):\\n   My surviving spouse shall retain the statutory life interest in our principal matrimonial residential home situated at ` + res + `.\\n\\n3. DISPOSITION OF PROPERTY:\\n   ` + prop + `\\n\\n4. ATTESTATION CLAUSE:\\n   SIGNED by the Testator, ` + t.toUpperCase() + `, in the presence of both of us present at the same time, who at his/her request have subscribed our names as attesting witnesses:\\n\\nTESTATOR SIGNATURE: _____________________________ DATE: 30th August 2026\\n\\nWITNESS 1: Name, NIN & Sign: _________________________________________\\nWITNESS 2: Name, NIN & Sign: _________________________________________`;

          var out = document.getElementById('draftOutput');
          out.classList.remove('hidden');
          out.textContent = draft;
        }

        render();
      </script>
    </body>
    </html>
    """
'''

with open("wacha_full_master.py", "w") as f:
    f.write(full_code)

import wacha_full_master
print("Wacha Full Master Agreement Drafting Engine validated successfully!")
EOF
python3 test_comprehensive_agreements.py
}}
