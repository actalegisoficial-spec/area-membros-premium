/* =========================================================
   Acta Members – Calculadora de Honorários  (versão 3)
   Módulo independente (JS puro, sem dependências).

   Integração:  ActaCalc.render(document.getElementById('calculadora-view'))
                ActaCalc.reset()   → chamar ao sair da conta (logout)

   Persistência:
   - Dentro da área de membros usa o cliente Supabase global `sb`
     (tabelas calc_perfis e calc_orcamentos + bucket calc-logos, ver supabase.sql).
   - Fora dela (preview.html) cai para localStorage.
   ========================================================= */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Dados padrão (vindos da planilha original)
  // ---------------------------------------------------------------------------
  var DEFAULT_SERVICOS = [
    ['Reg. documentos e registros', 'Escritura pública (compra/herança/contratos antigos)', 6, 4, 10, 'Variável conforme complexidade documental'],
    ['Reg. documentos e registros', 'Registro de imóveis – retificação', 20, 12, 40, 'Exige plantas/ART e diligências'],
    ['Reg. documentos e registros', 'Registro de imóveis – averbações/contratos', 8, 4, 16, 'Averbação de construção, casamento, etc.'],
    ['Reg. documentos e registros', 'Usucapião (judicial ou extrajudicial)', 40, 24, 80, 'Coleta de provas/testemunhas; cartórios'],
    ['Reg. documentos e registros', 'Alterações cadastrais (uso/zoneamento/CNAE)', 8, 4, 16, 'Inclui consultas à prefeitura'],
    ['Fundiária/Urbanística', 'REURB – Regularização fundiária urbana', 80, 60, 160, 'Equipe multidisciplinar; cronograma longo'],
    ['Fundiária/Urbanística', 'Regularização fundiária de imóveis comerciais', 48, 32, 96, 'Levantamento + projeto + legalização'],
    ['Fundiária/Urbanística', 'Regularização de imóvel comercial (MEI/PMEs)', 24, 16, 48, 'Licenças e adequações'],
    ['Fundiária/Urbanística', 'Acompanhamento com prefeitura (alvará/licenças/aprovação de planta)', 20, 12, 40, 'Taxas e revisões de projeto'],
    ['Ações técnicas/urbanísticas', 'Construção (aprovação/averbação)', 18, 12, 36, 'Depende de metragem e projetos'],
    ['Ações técnicas/urbanísticas', 'Unificação', 16, 10, 30, 'Matrículas e plantas'],
    ['Ações técnicas/urbanísticas', 'Loteamento', 120, 80, 240, 'Processo longo com diversas etapas'],
    ['Ações técnicas/urbanísticas', 'Demolição', 10, 6, 20, 'Licenças específicas'],
    ['Ações técnicas/urbanísticas', 'Desmembramento', 24, 16, 48, 'Levantamento topográfico'],
    ['Ações técnicas/urbanísticas', 'Condomínio', 60, 40, 120, 'Instituição e convenção'],
    ['Registros/Escrituras', 'Retificação de área ou de registro', 20, 12, 40, 'Pode exigir topografia/ART'],
    ['Registros/Escrituras', 'Cancelamento de ônus', 6, 4, 10, 'Ex.: penhoras/hipotecas'],
    ['Registros/Escrituras', 'Hipoteca', 6, 4, 10, 'Contrato e registro'],
    ['Registros/Escrituras', 'Dação em pagamento', 10, 6, 18, 'Análise contratual'],
    ['Registros/Escrituras', 'Alienação fiduciária', 6, 4, 10, 'Instrumento + registro'],
    ['Registros/Escrituras', 'Contratos particulares', 5, 3, 10, 'Minuta e ajustes'],
    ['Registros/Escrituras', 'Permuta', 10, 6, 18, 'Eventuais avaliações'],
    ['Registros/Escrituras', 'Adjudicação compulsória', 30, 20, 60, 'Judicial/extrajudicial'],
    ['Família/Patrimônio', 'Casamento (averbação/registro relacionado)', 3, 2, 6, 'Ações simples no registro'],
    ['Família/Patrimônio', 'Inventário', 40, 24, 100, 'Judicial/extrajudicial; herdeiros'],
    ['Família/Patrimônio', 'Doação', 8, 4, 16, 'Tributação pode variar'],
    ['Família/Patrimônio', 'Divórcio', 25, 16, 60, 'Consensual acelera'],
    ['Família/Patrimônio', 'Usufruto (constituição/cancelamento)', 8, 4, 16, 'Registro e eventuais certidões'],
    ['Família/Patrimônio', 'Arrematação (regularização pós-leilão)', 12, 8, 24, 'Levantamento de ônus']
  ];

  var EXEMPLO_CUSTOS = [
    ['Internet', 100], ['Telefone', 100], ['Softwares / Ferramentas', 500], ['Contabilidade / Impostos', 180],
    ['Aluguel / Escritório', 1500], ['Energia + Água', 300], ['IPTU', 75], ['Transporte / Combustível', 800],
    ['Alimentação (trabalho)', 1000], ['Marketing / Anúncios', 500], ['Assinaturas profissionais (CREA/CAU/OAB)', 80], ['Outros', 1000]
  ];

  var ADICIONAIS_PADRAO = ['Deslocamento (km/transporte)', 'Impressões / Documentos', 'Taxas bancárias / financeiras', 'Honorários de terceiros (engenheiro/topógrafo)'];

  function defaultServicos() {
    return DEFAULT_SERVICOS.map(function (r, i) {
      return { id: 's' + (i + 1), categoria: r[0], nome: r[1], horas: r[2], min: r[3], max: r[4], obs: r[5] };
    });
  }

  function defaultProfile(userName) {
    return {
      versao: 2,
      custos: EXEMPLO_CUSTOS.map(function (c) { return { nome: c[0], valor: 0 }; }),
      horasSemana: 20,
      semanasMes: 4.5,
      margem: 50,
      servicos: defaultServicos(),
      rapido: [
        { nome: 'Regularização simples', horas: 6 },
        { nome: 'Regularização com diligências', horas: 12 },
        { nome: 'Caso completo (laudos + prefeitura)', horas: 25 }
      ],
      marca: { nome: userName || '', profissao: '', registro: '', telefone: '', email: '', cidade: '', site: '', logo: '' },
      padroesOrc: { taxaPlataforma: 4.9, impostos: 4, validadeDias: 15, pagamentos: [
        { id: 'pgd1', tipo: 'avista', meio: 'pix', desconto: 0 },
        { id: 'pgd2', tipo: 'parcelado', meio: 'cartao', parcelas: 12, jurosModo: 'sem', juros: 0 }
      ] },
      // servicosConfirmados: só vira true quando o aluno confirma ou salva a revisão dos serviços
      // marcaSalva: só vira true quando o aluno clica em "Salvar dados" em Minha Marca
      // tourVisto: guia da primeira visita já foi mostrado
      flags: { servicosConfirmados: false, checklistOculto: false, marcaSalva: false, tourVisto: false }
    };
  }

  // ---------------------------------------------------------------------------
  // Textos de ajuda
  // ---------------------------------------------------------------------------
  var HELP = {
    custos: 'Gastos fixos que você tem todo mês, mesmo sem nenhum serviço. Use valores médios mensais. Se algo é anual (ex.: CREA), divida por 12.',
    horasSemana: 'Horas que você consegue VENDER por semana. Não conte reuniões internas, WhatsApp e administrativo. Seja realista (ex.: 20 h).',
    semanasMes: 'Média de semanas em um mês. Use 4,5 (entre 4 e 5 semanas).',
    horasMes: 'Calculado automaticamente: horas por semana × semanas no mês.',
    margem: 'Percentual acrescentado sobre o seu custo por hora para ter lucro. Funciona como colchão para ociosidade, imprevistos e risco. Sugestão inicial: 50%.',
    custoHora: 'Custos fixos do mês ÷ horas produtivas do mês. É o piso: abaixo disso você tem prejuízo.',
    precoHora: 'Custo por hora × (1 + margem). É o valor recomendado para as suas propostas e alimenta Serviços, Cálculo Rápido e Orçamento.',
    horasCobrar: 'Horas a cobrar: quantas horas você cobra por este serviço. É o número que entra no cálculo. Considere atendimento, análise documental, cartório/prefeitura, documentos, protocolos e reuniões. Mín. e Máx. são só referências de variação.',
    despesas: 'Despesas variáveis deste caso: deslocamento, impressões, taxas bancárias, honorários de terceiros (engenheiro, topógrafo, despachante), certidões.',
    totalAntes: 'Serviços (horas × valor da sua hora) + despesas do caso. É o preço antes de qualquer desconto.',
    desconto: 'Desconto negociado com este cliente (ex.: indicação, fechamento de pacote). Vale para qualquer forma de pagamento. Para dar desconto só a quem paga à vista, use o desconto da forma de pagamento À vista.',
    descontoEntrada: 'Desconto aplicado só sobre o valor da entrada (ex.: 5% para quem paga a entrada no Pix). As parcelas não mudam.',
    bruto: 'Serviços + despesas do caso. É o valor base da proposta; descontos e acréscimos ficam em cada forma de pagamento.',
    taxaPlataforma: 'Taxas de maquininha, cartão, plataforma de pagamento etc. Dinheiro que fica com a plataforma.',
    impostos: 'ISS, DAS, INSS, Simples Nacional, MEI etc. Valor que vai para o governo.',
    taxaTotal: 'Plataforma + impostos: a porcentagem que vai embora e não fica com você.',
    liquido: 'Quanto realmente sobra no seu bolso depois das taxas e impostos.',
    meta: 'Quanto você quer que chegue no seu bolso, já descontadas as taxas. Sua meta de ganho real.',
    brutoNec: 'Quanto cobrar do cliente (já com desconto) para que, depois das taxas, sobre a sua meta.',
    totalNec: 'O preço antes do desconto que, depois do desconto e das taxas, ainda entrega a sua meta.',
    pagamento: 'As condições que você oferece ao cliente. Saem na proposta em PDF. O valor da proposta não muda: cada opção mostra o total que o cliente paga nela.',
    juros: 'Sem juros: o cliente paga o valor da proposta e você absorve o custo (ex.: taxa da maquininha). Juros ao mês: parcelas fixas, como num financiamento (Tabela Price). Acréscimo total: um percentual único sobre o valor, como na tabela da maquininha (ex.: 12x = +15%).',
    descontoAvista: 'Desconto extra para quem paga à vista nesta forma. É aplicado sobre o valor da proposta.',
    entrada: 'Quanto o cliente paga na hora. O restante é parcelado.'
  };

  // ---------------------------------------------------------------------------
  // Utilitários
  // ---------------------------------------------------------------------------
  var BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  var NUM = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
  var MONEY_PLAIN = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function money(v) { return BRL.format(isFinite(v) ? v : 0); }
  function fmtN(v) { return NUM.format(isFinite(v) ? v : 0); }
  function moneyPlain(v) { return MONEY_PLAIN.format(isFinite(v) ? v : 0); }
  function num(v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    if (v == null || v === '') return 0;
    var s = String(v).trim();
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(s);
    return isFinite(n) ? n : 0;
  }
  // Valores em reais digitados no padrão brasileiro: "1.500,50", "1500", "1.500"
  function parseMoney(v) {
    var s = String(v == null ? '' : v).replace(/[^\d,.]/g, '');
    if (!s) return 0;
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    var n = parseFloat(s);
    return isFinite(n) ? n : 0;
  }
  function pos(v) { return Math.max(0, num(v)); }
  function sum(arr, fn) { return (arr || []).reduce(function (a, x) { return a + fn(x); }, 0); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function todayISO() { var d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date();
  }
  function datas(o) {
    var envio = parseISO(o.dataEnvio);
    var validade = new Date(envio.getFullYear(), envio.getMonth(), envio.getDate() + Math.round(pos(o.validadeDias)));
    return { envio: envio, validade: validade };
  }
  function hhmm(d) { return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
  function fmtDate(d) { try { return new Date(d).toLocaleDateString('pt-BR'); } catch (e) { return ''; } }
  function icon(name) { return '<i data-lucide="' + name + '"></i>'; }
  function help(key) {
    return '<button type="button" class="ac-help" aria-label="Ajuda" data-act="help">?<span class="ac-tip" role="tooltip">' + esc(HELP[key]) + '</span></button>';
  }
  function toast(msg, type) {
    if (typeof window.appShowToast === 'function') { window.appShowToast(msg, type || 'success'); return; }
    var t = document.createElement('div');
    t.className = 'ac-toast-fallback' + (type ? ' ' + type : '');
    t.setAttribute('role', 'status');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  }
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }
  function isIOS() {
    return /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  var uidSeq = 0;

  // ---------------------------------------------------------------------------
  // Cálculos (espelham as fórmulas da planilha)
  // ---------------------------------------------------------------------------
  function calcHora(p) {
    var totalCustos = sum(p.custos, function (c) { return pos(c.valor); });
    var horasMes = pos(p.horasSemana) * pos(p.semanasMes);
    var custoHora = horasMes > 0 ? totalCustos / horasMes : 0;
    var precoHora = custoHora * (1 + pos(p.margem) / 100);
    return { totalCustos: totalCustos, horasMes: horasMes, custoHora: custoHora, precoHora: precoHora };
  }

  function calcOrc(o, precoHora) {
    var subServ = sum(o.itens, function (i) { return pos(i.horas) * precoHora; });
    var horasTot = sum(o.itens, function (i) { return pos(i.horas); });
    var adic = sum(o.adicionais, function (a) { return pos(a.valor); });
    var total = subServ + adic;
    var d = pos(o.desconto) / 100;
    var bruto = total * (1 - d);
    var taxa = (pos(o.taxaPlataforma) + pos(o.impostos)) / 100;
    var liquido = bruto * (1 - taxa);
    var meta = pos(o.metaLiquida);
    var valido = taxa < 1 && d < 1;
    var brutoNec = meta > 0 && valido ? meta / (1 - taxa) : 0;
    var totalNec = meta > 0 && valido ? brutoNec / (1 - d) : 0;
    var folga = meta > 0 && valido ? total - totalNec : 0; // >= 0: cobrando bem
    return {
      subServ: subServ, horasTot: horasTot, adic: adic, total: total, descontoValor: total - bruto,
      bruto: bruto, taxa: taxa, liquido: liquido, meta: meta, brutoNec: brutoNec, totalNec: totalNec,
      folga: folga, valido: valido
    };
  }

  // Orçamento finalizado usa o preço/hora travado no momento da finalização
  function precoDoOrc(o) {
    return o && o.precoHoraFixo != null ? num(o.precoHoraFixo) : calcHora(S.profile).precoHora;
  }
  function isRascunho(o) { return !!o && o.status === 'rascunho'; }

  // ---------------------------------------------------------------------------
  // Formas de pagamento
  // ---------------------------------------------------------------------------
  var TIPOS_PAG = { avista: 'À vista', parcelado: 'Parcelado', misto: 'Entrada + parcelas' };
  var MEIOS_AVISTA = [['pix', 'Pix', 'no Pix'], ['dinheiro', 'Dinheiro', 'em dinheiro'], ['transferencia', 'Transferência bancária', 'por transferência'], ['debito', 'Cartão de débito', 'no cartão de débito']];
  var MEIOS_PARC = [['cartao', 'Cartão de crédito', 'no cartão de crédito'], ['pix', 'Pix parcelado', 'no Pix parcelado'], ['boleto', 'Boleto parcelado', 'no boleto']];
  var MAX_PAGAMENTOS = 4;

  function meioTxt(lista, id, idx) { var m = lista.filter(function (x) { return x[0] === id; })[0] || lista[0]; return m[idx]; }
  function limitesParc(meio, misto) { return meio === 'cartao' ? [1, 12] : [misto ? 1 : 2, 24]; }
  function nParcelas(pg) {
    var l = limitesParc(pg.meio, pg.tipo === 'misto');
    return Math.min(l[1], Math.max(l[0], Math.round(num(pg.parcelas) || l[0])));
  }

  function novaPag(tipo) {
    var id = 'pg' + Date.now() + Math.floor(Math.random() * 1000);
    if (tipo === 'avista') return { id: id, tipo: 'avista', meio: 'pix', desconto: 0 };
    if (tipo === 'misto') return { id: id, tipo: 'misto', entradaModo: 'pct', entrada: 30, entradaMeio: 'pix', entradaDesconto: 0, meio: 'cartao', parcelas: 3, jurosModo: 'sem', juros: 0 };
    return { id: id, tipo: 'parcelado', meio: 'cartao', parcelas: 12, jurosModo: 'sem', juros: 0 };
  }

  // Divide P em n parcelas conforme o modo de juros
  //  sem    → sem juros (o aluno absorve)
  //  mensal → juros de x% ao mês, parcelas fixas (Tabela Price)
  //  total  → acréscimo de x% sobre o valor (como a tabela da maquininha)
  function parcelar(P, n, modo, taxa) {
    if (P <= 0 || n < 1) return { parcela: 0, total: 0 };
    var t = pos(taxa) / 100, parcela;
    if (modo === 'mensal' && t > 0) parcela = P * t / (1 - Math.pow(1 + t, -n));
    else if (modo === 'total' && t > 0) parcela = P * (1 + t) / n;
    else parcela = P / n;
    return { parcela: parcela, total: parcela * n };
  }

  function calcPag(pg, base) {
    var r = { base: base, total: base, parcela: 0, n: 0, entrada: 0, restante: 0, comJuros: false };
    if (pg.tipo === 'avista') {
      r.total = base * (1 - Math.min(pos(pg.desconto), 100) / 100);
      return r;
    }
    var P = base;
    if (pg.tipo === 'misto') {
      // r.entrada = parte da proposta coberta pela entrada; r.entradaPaga = o que o cliente paga nela (com desconto)
      r.entrada = pg.entradaModo === 'valor' ? Math.min(pos(pg.entrada), base) : base * Math.min(pos(pg.entrada), 100) / 100;
      r.entradaDesc = Math.min(pos(pg.entradaDesconto), 100);
      r.entradaPaga = r.entrada * (1 - r.entradaDesc / 100);
      P = base - r.entrada;
      r.restante = P;
    }
    r.n = nParcelas(pg);
    var p = parcelar(P, r.n, pg.jurosModo, pg.juros);
    r.parcela = p.parcela;
    r.total = (pg.tipo === 'misto' ? r.entradaPaga : 0) + p.total;
    r.comJuros = pg.jurosModo !== 'sem' && pos(pg.juros) > 0;
    return r;
  }

  // Texto da condição. Na tela mostra a taxa de juros/acréscimo; no PDF (paraPdf) ela fica oculta.
  function descPag(pg, r, paraPdf) {
    var juros = '';
    if (pg.tipo !== 'avista') {
      if (!r.comJuros) juros = r.n > 1 ? ' sem juros' : '';
      else if (!paraPdf) juros = ' (' + (pg.jurosModo === 'mensal' ? 'juros de ' + fmtN(pos(pg.juros)) + '% ao mês' : 'acréscimo de ' + fmtN(pos(pg.juros)) + '%') + ')';
    }
    if (pg.tipo === 'avista') {
      return 'À vista ' + meioTxt(MEIOS_AVISTA, pg.meio, 2) + ': ' + money(r.total) + (pos(pg.desconto) > 0 ? ' (' + fmtN(pos(pg.desconto)) + '% de desconto)' : '');
    }
    var parc = r.n + 'x de ' + money(r.parcela) + ' ' + meioTxt(MEIOS_PARC, pg.meio, 2);
    if (pg.tipo === 'parcelado') return (r.n === 1 ? '1x de ' + money(r.parcela) + ' ' + meioTxt(MEIOS_PARC, pg.meio, 2) : 'Em ' + parc) + juros;
    return 'Entrada de ' + money(r.entradaPaga) + ' ' + meioTxt(MEIOS_AVISTA, pg.entradaMeio, 2) +
      (r.entradaDesc > 0 ? ' (' + fmtN(r.entradaDesc) + '% de desconto)' : '') + ' + ' + parc + juros;
  }

  // ---------------------------------------------------------------------------
  // Persistência
  // ---------------------------------------------------------------------------
  function getSb() {
    try { if (typeof sb !== 'undefined' && sb && typeof sb.from === 'function') return sb; } catch (e) { /* noop */ }
    if (window.sb && typeof window.sb.from === 'function') return window.sb;
    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') return window.supabaseClient;
    return null;
  }

  var LOGO_BUCKET = 'calc-logos';

  var SupabaseStore = {
    uid: null,
    init: async function () {
      var r = await getSb().auth.getUser();
      if (!r.data || !r.data.user) throw new Error('Usuário não autenticado');
      this.uid = r.data.user.id;
    },
    currentUid: async function () {
      try { var r = await getSb().auth.getSession(); return r.data && r.data.session ? r.data.session.user.id : null; }
      catch (e) { return this.uid; }
    },
    loadProfile: async function () {
      var r = await getSb().from('calc_perfis').select('dados').eq('user_id', this.uid).maybeSingle();
      if (r.error) throw r.error;
      return r.data ? r.data.dados : null;
    },
    saveProfile: async function (dados) {
      var r = await getSb().from('calc_perfis').upsert({ user_id: this.uid, dados: dados, updated_at: new Date().toISOString() });
      if (r.error) throw r.error;
    },
    listOrcs: async function () {
      var r = await getSb().from('calc_orcamentos').select('id, cliente, total, dados, updated_at').eq('user_id', this.uid).order('updated_at', { ascending: false });
      if (r.error) throw r.error;
      return r.data || [];
    },
    saveOrc: async function (dados, total) {
      var row = { user_id: this.uid, cliente: dados.cliente || '', total: total, dados: dados, updated_at: new Date().toISOString() };
      var r;
      if (dados.id) r = await getSb().from('calc_orcamentos').update(row).eq('id', dados.id).select('id, updated_at').maybeSingle();
      else r = await getSb().from('calc_orcamentos').insert(row).select('id, updated_at').single();
      if (r.error) throw r.error;
      if (!r.data) { var e = new Error('Orçamento não encontrado'); e.gone = true; throw e; }
      return r.data;
    },
    deleteOrc: async function (id) {
      var r = await getSb().from('calc_orcamentos').delete().eq('id', id);
      if (r.error) throw r.error;
    },
    // Logo vai para o Storage (arquivo), e não para dentro do perfil
    uploadLogo: async function (dataUrl) {
      var blob = await (await fetch(dataUrl)).blob();
      var path = this.uid + '/logo.png';
      var up = await getSb().storage.from(LOGO_BUCKET).upload(path, blob, { upsert: true, contentType: 'image/png', cacheControl: '3600' });
      if (up.error) throw up.error;
      var pub = getSb().storage.from(LOGO_BUCKET).getPublicUrl(path);
      return pub.data.publicUrl + '?v=' + Date.now();
    },
    removeLogo: async function () {
      try { await getSb().storage.from(LOGO_BUCKET).remove([this.uid + '/logo.png']); } catch (e) { /* noop */ }
    }
  };

  var LocalStore = {
    k: function (s) { return 'actaCalc:' + s; },
    read: function (s, def) { try { var v = localStorage.getItem(this.k(s)); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    write: function (s, v) { try { localStorage.setItem(this.k(s), JSON.stringify(v)); } catch (e) { throw e; } },
    init: async function () {},
    currentUid: async function () { return null; },
    loadProfile: async function () { return this.read('perfil', null); },
    saveProfile: async function (d) { this.write('perfil', d); },
    listOrcs: async function () { return this.read('orcs', []); },
    saveOrc: async function (dados, total) {
      var list = this.read('orcs', []);
      var now = new Date().toISOString();
      var id = dados.id || ('l' + Date.now() + Math.floor(Math.random() * 1000));
      dados.id = id;
      list = list.filter(function (x) { return x.id !== id; });
      list.unshift({ id: id, cliente: dados.cliente || '', total: total, dados: dados, updated_at: now });
      this.write('orcs', list);
      return { id: id, updated_at: now };
    },
    deleteOrc: async function (id) { this.write('orcs', this.read('orcs', []).filter(function (x) { return x.id !== id; })); },
    uploadLogo: null,
    removeLogo: async function () {}
  };

  // ---------------------------------------------------------------------------
  // Estado
  // ---------------------------------------------------------------------------
  var S;
  function freshState() {
    return {
      root: S ? S.root : null, store: null, loaded: false, loading: null, uid: null,
      profile: null, orcs: [], orc: null, tab: 'hora', orcView: 'lista', busca: '', limite: { r: 10, f: 10 },
      svDraft: null, mkDraft: null, undoAjuste: null,
      pRev: 0, pSavedRev: 0, pTimer: null, pChain: Promise.resolve(),
      oTimer: null, oTimerTarget: null, oChain: Promise.resolve(), orcRev: new WeakMap(), orcSavedRev: new WeakMap(),
      status: 'ok', savedAt: null
    };
  }
  S = freshState();

  function currentUserName() {
    try { if (typeof state !== 'undefined' && state && state.user) return state.user.name || ''; } catch (e) { /* noop */ }
    return '';
  }

  function migrate(p) {
    var d = defaultProfile(currentUserName());
    if (!p || typeof p !== 'object') return d;
    Object.keys(d).forEach(function (k) { if (p[k] == null) p[k] = d[k]; });
    p.marca = Object.assign({}, d.marca, p.marca || {});
    p.padroesOrc = Object.assign({}, d.padroesOrc, p.padroesOrc || {});
    p.flags = Object.assign({}, d.flags, p.flags || {});
    p.rapido = (p.rapido || []).filter(Boolean);
    return p;
  }

  // Orçamentos antigos (antes dos status) passam a contar como finalizados
  function migrateOrcRow(r) {
    var o = r.dados || {};
    if (!o.status) o.status = 'finalizado';
    // Finalizados sem preço travado: trava com a hora atual para não mudarem mais
    if (o.status !== 'rascunho' && o.precoHoraFixo == null) o.precoHoraFixo = calcHora(S.profile).precoHora;
    o.id = r.id;
    r.dados = o;
    return r;
  }

  function newOrc() {
    var po = S.profile.padroesOrc;
    return {
      id: null, status: 'rascunho', cliente: '', documento: '', email: '', telefone: '', endereco: '', descricao: '',
      dataEnvio: todayISO(), validadeDias: po.validadeDias,
      itens: [],
      adicionais: ADICIONAIS_PADRAO.map(function (d) { return { desc: d, valor: 0 }; }),
      pagamentos: clone(po.pagamentos || []).map(function (pg, k) { pg.id = 'pg' + Date.now() + k; return pg; }),
      desconto: 0, taxaPlataforma: po.taxaPlataforma, impostos: po.impostos, metaLiquida: 0,
      observacoes: '', mostrarHoras: false, criadoEm: new Date().toISOString()
    };
  }

  async function ensureLoaded() {
    if (S.loaded) return;
    if (S.loading) return S.loading;
    S.loading = (async function () {
      S.store = getSb() ? SupabaseStore : LocalStore;
      await S.store.init();
      S.uid = S.store.uid || null;
      S.profile = migrate(await S.store.loadProfile());
      S.orcs = (await S.store.listOrcs()).map(migrateOrcRow);
      S.orc = null;
      S.loaded = true;
    })();
    try { await S.loading; } finally { S.loading = null; }
  }

  // ---------------------------------------------------------------------------
  // Guia passo a passo (aparece sozinho na 1ª visita; depois pelo botão "Ver guia")
  // ---------------------------------------------------------------------------
  var TOUR = [
    { sel: null, titulo: 'Bem-vindo ao Acta Price!',
      texto: 'Aqui você descobre quanto vale a sua hora, monta orçamentos sem prejuízo e gera a proposta em PDF com a sua marca. Vamos ver como funciona em poucos passos.' },
    { sel: '[data-region="checklist"] .ac-checklist', titulo: 'Seus primeiros passos',
      texto: 'Esta lista mostra o que falta para você começar. Cada etapa fica riscada quando você conclui. Toque em uma etapa para ir direto para ela.' },
    { sel: '#ac-tab-hora', titulo: '1. Minha Hora',
      texto: 'Comece por aqui: informe seus custos fixos do mês, quantas horas consegue vender por semana e a margem de lucro. A calculadora encontra o preço justo da sua hora.' },
    { sel: '#ac-tab-servicos', titulo: '2. Serviços',
      texto: 'Revise a lista de serviços e quantas horas cada um leva. O valor de cada serviço é calculado com a sua hora.' },
    { sel: '#ac-tab-rapido', titulo: 'Cálculo Rápido',
      texto: 'Precisa de um valor na hora, no WhatsApp? Use o Cálculo Rápido para estimar sem montar um orçamento completo.' },
    { sel: '#ac-tab-marca', titulo: '3. Minha Marca',
      texto: 'Cadastre seu nome, contatos e logo. Esses dados aparecem na proposta em PDF. Lembre de clicar em "Salvar dados".' },
    { sel: '#ac-tab-orcamento', titulo: '4. Orçamentos',
      texto: 'Monte o orçamento do cliente, escolha as formas de pagamento e gere a proposta em PDF. Rascunhos podem ser editados; ao baixar o PDF, o orçamento é finalizado e os valores ficam travados.' },
    { sel: '.ac-tour-again', titulo: 'Pronto!',
      texto: 'Seus dados ficam salvos na sua conta e só você tem acesso. Se quiser rever este guia, é só tocar aqui.' }
  ];

  function startTour() {
    if (!S.root || !S.profile) return;
    endTour(false);
    S.tourOn = true;
    S.tourStep = 0;
    var ov = document.createElement('div');
    ov.className = 'ac-tour';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Guia do Acta Price');
    ov.innerHTML = '<div class="ac-tour-shade"></div><div class="ac-tour-ring"></div><div class="ac-tour-box"></div>';
    document.body.appendChild(ov);
    S.tourEl = ov;
    ov.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tour]');
      if (!b) return;
      var a = b.getAttribute('data-tour');
      if (a === 'next') tourGo(S.tourStep + 1, false, 1);
      else if (a === 'prev') tourGo(S.tourStep - 1, false, -1);
      else endTour(true);
    });
    S.tourKey = function (e) { if (e.key === 'Escape') endTour(true); };
    document.addEventListener('keydown', S.tourKey);
    S.tourResize = function () { if (S.tourOn) tourGo(S.tourStep, true, 1); };
    window.addEventListener('resize', S.tourResize);
    // se a pessoa rolar a tela durante o guia, o destaque acompanha o item
    S.tourScroll = function () {
      if (!S.tourOn || !S.tourAlvo || !S.tourEl) return;
      tourPosicionar(S.tourAlvo, S.tourEl.querySelector('.ac-tour-box'), S.tourEl.querySelector('.ac-tour-ring'), S.tourEl.querySelector('.ac-tour-shade'));
    };
    window.addEventListener('scroll', S.tourScroll, true);
    tourGo(0, false, 1);
  }

  function tourGo(i, soPosicao, dir) {
    if (!S.tourEl) return;
    if (i < 0) i = 0;
    if (i >= TOUR.length) { endTour(true); return; }
    var step = TOUR[i];
    var alvo = step.sel ? S.root.querySelector(step.sel) : null;
    // pula etapas cujo alvo não existe (ex.: lista de primeiros passos oculta ou já concluída)
    if (step.sel && !alvo) {
      var j = i + (dir || 1);
      if (j >= 0 && j < TOUR.length) return tourGo(j, soPosicao, dir);
    }
    S.tourStep = i;
    S.tourAlvo = alvo;
    var box = S.tourEl.querySelector('.ac-tour-box');
    var shade = S.tourEl.querySelector('.ac-tour-shade');
    var ring = S.tourEl.querySelector('.ac-tour-ring');
    var ultimo = i === TOUR.length - 1;
    if (!soPosicao) {
      box.innerHTML = '<div class="ac-tour-count">' + (i + 1) + ' de ' + TOUR.length + '</div>' +
        '<h3>' + esc(step.titulo) + '</h3><p>' + esc(step.texto) + '</p>' +
        '<div class="ac-tour-actions">' +
        (ultimo ? '' : '<button type="button" class="ac-link" data-tour="skip">Pular guia</button>') +
        '<span style="flex:1"></span>' +
        (i > 0 ? '<button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-tour="prev">Voltar</button>' : '') +
        '<button type="button" class="ac-btn ac-btn-primary ac-btn-sm" data-tour="next">' + (ultimo ? 'Começar' : 'Próximo') + '</button></div>';
      var nb = box.querySelector('[data-tour="next"]');
      if (nb) { try { nb.focus({ preventScroll: true }); } catch (x) { nb.focus(); } }
    }
    if (!alvo) {
      ring.style.display = 'none';
      shade.style.display = 'block';
      box.className = 'ac-tour-box ac-tour-center';
      box.style.top = ''; box.style.left = ''; box.style.width = '';
      return;
    }
    shade.style.display = 'block';
    ring.style.display = 'none';
    // no celular as abas rolam para o lado: traz a aba indicada para a vista
    var tabs = alvo.closest('.ac-tabs');
    if (tabs) tabs.scrollLeft = Math.max(0, alvo.offsetLeft - 24);
    try { alvo.scrollIntoView({ block: 'center', behavior: soPosicao ? 'auto' : 'smooth' }); } catch (x) { alvo.scrollIntoView(); }
    setTimeout(function () { tourPosicionar(alvo, box, ring, shade); }, soPosicao ? 0 : 400);
  }

  function tourPosicionar(alvo, box, ring, shade) {
    if (!S.tourOn) return;
    box.className = 'ac-tour-box';
    var r = alvo.getBoundingClientRect();
    // anel dourado por cima do item (o escurecido em volta vem da sombra do anel)
    var pad = 6;
    ring.style.top = (r.top - pad) + 'px'; ring.style.left = (r.left - pad) + 'px';
    ring.style.width = (r.width + 2 * pad) + 'px'; ring.style.height = (r.height + 2 * pad) + 'px';
    ring.style.display = 'block';
    shade.style.display = 'none';
    var vw = window.innerWidth, vh = window.innerHeight, m = 12;
    var bw = Math.min(360, vw - 2 * m);
    box.style.width = bw + 'px';
    var bh = box.offsetHeight;
    var top = r.bottom + m;
    if (top + bh > vh - m) top = r.top - bh - m;   // não cabe embaixo: vai para cima
    if (top < m) top = Math.max(m, vh - bh - m);    // não cabe em cima: fica no pé da tela
    var left = Math.min(Math.max(m, r.left + r.width / 2 - bw / 2), vw - bw - m);
    box.style.top = top + 'px';
    box.style.left = left + 'px';
  }

  function endTour(marcarVisto) {
    if (S.tourEl && S.tourEl.parentNode) S.tourEl.parentNode.removeChild(S.tourEl);
    if (S.tourKey) document.removeEventListener('keydown', S.tourKey);
    if (S.tourResize) window.removeEventListener('resize', S.tourResize);
    if (S.tourScroll) window.removeEventListener('scroll', S.tourScroll, true);
    S.tourAlvo = null; S.tourScroll = null;
    S.tourEl = null; S.tourOn = false; S.tourKey = null; S.tourResize = null;
    if (marcarVisto && S.profile && !S.profile.flags.tourVisto) {
      S.profile.flags.tourVisto = true;
      scheduleProfileSave();
    }
  }

  // Limpa tudo (logout ou troca de conta)
  function reset() {
    endTour(false);
    var root = S.root;
    clearTimeout(S.pTimer); clearTimeout(S.oTimer);
    S = freshState();
    S.root = root;
    if (root) root.innerHTML = '';
  }

  // ---------------------------------------------------------------------------
  // Salvamento (filas em ordem: nunca dois salvamentos ao mesmo tempo)
  // ---------------------------------------------------------------------------
  function setStatus(s, justSaved) {
    S.status = s;
    if (s === 'ok' && justSaved) S.savedAt = new Date();
    if (!S.root) return;
    var txt = s === 'saving' ? 'Salvando…' :
      s === 'err' ? 'Sem conexão. Suas alterações serão salvas assim que a internet voltar.' :
      (S.savedAt ? 'Salvo às ' + hhmm(S.savedAt) : '');
    S.root.querySelectorAll('[data-out="status"]').forEach(function (el) {
      el.className = 'ac-status' + (s === 'saving' ? ' saving' : s === 'err' ? ' err' : '');
      el.textContent = txt;
    });
  }

  function profileDirty() { return S.pRev > S.pSavedRev; }

  function scheduleProfileSave() {
    S.pRev++;
    setStatus('saving');
    clearTimeout(S.pTimer);
    S.pTimer = setTimeout(saveProfileNow, 700);
  }
  function saveProfileNow() {
    clearTimeout(S.pTimer); S.pTimer = null;
    var rev = S.pRev, store = S.store, prof = S.profile;
    S.pChain = S.pChain.then(function () { return store.saveProfile(prof); }).then(function () {
      if (store !== S.store) return;
      S.pSavedRev = Math.max(S.pSavedRev, rev);
      if (!profileDirty() && !S.oTimer) setStatus('ok', true);
      return true;
    }, function (e) {
      console.error('ActaCalc saveProfile', e);
      if (store !== S.store) return false;
      setStatus('err');
      clearTimeout(S.pTimer); S.pTimer = setTimeout(saveProfileNow, 5000);
      return false;
    });
    return S.pChain;
  }

  function orcHasContent(o) { return !!o && (!!(o.cliente && o.cliente.trim()) || o.itens.length > 0); }
  function orcDirty(o) { return !!o && (S.orcRev.get(o) || 0) > (S.orcSavedRev.get(o) || 0); }

  function touchOrc(o) {
    o = o || S.orc;
    if (!o) return;
    S.orcRev.set(o, (S.orcRev.get(o) || 0) + 1);
    if (!orcHasContent(o)) return;
    setStatus('saving');
    clearTimeout(S.oTimer);
    S.oTimerTarget = o;
    S.oTimer = setTimeout(function () { S.oTimer = null; saveOrcNow(o); }, 900);
  }
  function flushOrc() {
    if (S.oTimer) { clearTimeout(S.oTimer); S.oTimer = null; return saveOrcNow(S.oTimerTarget); }
    return Promise.resolve(true);
  }
  function saveOrcNow(target) {
    target = target || S.orc;
    if (!orcHasContent(target)) return Promise.resolve(true);
    var store = S.store;
    S.oChain = S.oChain.then(function () {
      var rev = S.orcRev.get(target) || 0;
      var c = calcOrc(target, precoDoOrc(target));
      var dados = clone(target);
      return store.saveOrc(dados, Math.round(c.bruto * 100) / 100).then(function (res) {
        if (store !== S.store) return true;
        target.id = res.id;
        S.orcSavedRev.set(target, Math.max(S.orcSavedRev.get(target) || 0, rev));
        dados.id = res.id;
        var row = { id: res.id, cliente: target.cliente, total: c.bruto, dados: dados, updated_at: res.updated_at };
        S.orcs = [row].concat(S.orcs.filter(function (x) { return x.id !== res.id; }));
        redrawRegion('saved');
        if (!S.oTimer && !profileDirty()) setStatus('ok', true);
        updateEditorStatus();
        return true;
      });
    }).catch(function (e) {
      console.error('ActaCalc saveOrc', e);
      if (store !== S.store) return false;
      if (e && e.gone) { target.id = null; return false; } // foi excluído em outro lugar
      setStatus('err');
      if (target === S.orc) { clearTimeout(S.oTimer); S.oTimerTarget = target; S.oTimer = setTimeout(function () { S.oTimer = null; saveOrcNow(target); }, 5000); }
      return false;
    });
    return S.oChain;
  }

  function draftDirty(kind) {
    if (kind === 'sv') return !!S.svDraft && JSON.stringify(S.svDraft) !== JSON.stringify(S.profile.servicos);
    return !!S.mkDraft && JSON.stringify(S.mkDraft) !== JSON.stringify(S.profile.marca);
  }
  function discardDrafts() {
    if ((draftDirty('sv') || draftDirty('mk')) && !confirm('Você tem alterações não salvas. Sair sem salvar?')) return false;
    S.svDraft = null; S.mkDraft = null;
    return true;
  }

  // ---------------------------------------------------------------------------
  // Render – estrutura
  // ---------------------------------------------------------------------------
  var TABS = [
    ['hora', 'clock', 'Minha Hora'],
    ['servicos', 'list-checks', 'Serviços'],
    ['rapido', 'zap', 'Cálculo Rápido'],
    ['orcamento', 'file-text', 'Orçamentos'],
    ['marca', 'badge-check', 'Minha Marca']
  ];

  async function render(root) {
    if (!root) return;
    S.root = root;
    if (!root.__acBound) { bindEvents(root); root.__acBound = true; }
    // Outra conta entrou no mesmo navegador? Recomeça do zero.
    if (S.loaded && S.store && S.store.currentUid) {
      var uid = await S.store.currentUid();
      if (S.uid && uid && uid !== S.uid) reset();
    }
    if (!S.loaded) {
      root.innerHTML = '<div class="ac-loading" role="status">Carregando sua calculadora…</div>';
      try { await ensureLoaded(); }
      catch (e) {
        console.error('ActaCalc load', e);
        root.innerHTML = '<div class="ac-loading" role="alert">Não foi possível carregar a calculadora. Verifique sua conexão e atualize a página.</div>';
        return;
      }
    }
    draw();
    if (S.profile && !S.profile.flags.tourVisto && !S.tourOn) setTimeout(startTour, 500);
  }

  function draw() {
    var root = S.root;
    root.innerHTML = '<div class="ac-root">' +
      '<div class="view-header"><h2>Calculadora de Honorários</h2>' +
      '<p>Descubra o valor da sua hora, precifique seus serviços e monte propostas sem prejuízo.' +
      ' <button type="button" class="ac-link ac-tour-again" data-act="tour">' + icon('compass') + 'Ver guia passo a passo</button></p></div>' +
      '<div data-region="checklist">' + renderChecklist() + '</div>' +
      '<div class="ac-tabs-wrap"><nav class="ac-tabs" role="tablist" aria-label="Seções da calculadora">' +
      TABS.map(function (t) {
        var on = S.tab === t[0];
        return '<button type="button" role="tab" id="ac-tab-' + t[0] + '" aria-selected="' + on + '" tabindex="' + (on ? 0 : -1) + '" class="ac-tab' + (on ? ' active' : '') + '" data-act="tab" data-tab="' + t[0] + '">' + icon(t[1]) + '<span>' + t[2] + '</span></button>';
      }).join('') + '</nav><span class="ac-status" data-out="status" aria-live="polite"></span></div>' +
      '<div data-region="tab" role="tabpanel" aria-labelledby="ac-tab-' + S.tab + '">' + renderTab() + '</div></div>';
    afterRender();
  }

  function redrawTab() {
    var el = S.root && S.root.querySelector('[data-region="tab"]');
    if (!el) return draw();
    el.innerHTML = renderTab();
    var ck = S.root.querySelector('[data-region="checklist"]');
    if (ck) ck.innerHTML = renderChecklist();
    afterRender();
  }

  function afterRender() {
    // Orçamento finalizado: campos somente leitura (botões de ajuda e PDF continuam ativos)
    if (S.tab === 'orcamento' && S.orcView === 'editor' && S.orc && !isRascunho(S.orc)) {
      S.root.querySelectorAll('.ac-editor [data-bind^="o."], .ac-editor select').forEach(function (el) { el.disabled = true; });
    }
    // Abas com rolagem lateral: mostra o degradê e mantém a aba ativa visível
    var tabs = S.root.querySelector('.ac-tabs');
    if (tabs) {
      var ativa = tabs.querySelector('.ac-tab.active');
      if (ativa && tabs.scrollWidth > tabs.clientWidth) tabs.scrollLeft = Math.max(0, ativa.offsetLeft - 16);
      var marcarRolagem = function () {
        tabs.classList.toggle('ac-more-right', tabs.scrollLeft + tabs.clientWidth < tabs.scrollWidth - 4);
      };
      marcarRolagem();
      tabs.onscroll = marcarRolagem;
    }
    setStatus(S.status);
    updateOutputs();
    linkLabels();
    validateAll();
    refreshIcons();
  }

  function redrawRegion(name) {
    var el = S.root && S.root.querySelector('[data-region="' + name + '"]');
    if (!el) return;
    if (name === 'saved') el.innerHTML = renderSavedList();
    if (name === 'checklist') el.innerHTML = renderChecklist();
    refreshIcons();
  }

  // Liga cada rótulo ao seu campo (leitores de tela)
  function linkLabels() {
    S.root.querySelectorAll('.ac-field').forEach(function (f) {
      var lab = f.querySelector('label.ac-label');
      var inp = f.querySelector('input:not([type=file]):not([type=checkbox]), select, textarea');
      if (!lab || !inp) return;
      if (!inp.id) inp.id = 'ac-f-' + (++uidSeq);
      lab.htmlFor = inp.id;
    });
  }

  function renderTab() {
    switch (S.tab) {
      case 'servicos': return tabServicos();
      case 'rapido': return tabRapido();
      case 'orcamento': return S.orcView === 'editor' && S.orc ? tabEditor() : tabLista();
      case 'marca': return tabMarca();
      default: return tabHora();
    }
  }

  function guide(title, body) {
    return '<details class="ac-guide"><summary>' + icon('book-open') + '<span>' + title + '</span>' +
      '<i data-lucide="chevron-down" class="ac-chev"></i></summary><div class="ac-guide-body">' + body + '</div></details>';
  }

  // ---- Campos ----
  function numInput(bind, value, opts) {
    opts = opts || {};
    var min = opts.min != null ? opts.min : 0;
    var inp = '<input class="ac-input' + (opts.cls ? ' ' + opts.cls : '') + '" type="number" step="any" inputmode="decimal" min="' + min + '"' +
      (opts.max != null ? ' max="' + opts.max + '" data-max="' + opts.max + '"' : '') + ' data-min="' + min + '"' +
      ' data-bind="' + bind + '" value="' + esc(value) + '"' +
      (opts.placeholder ? ' placeholder="' + esc(opts.placeholder) + '"' : '') + (opts.aria ? ' aria-label="' + esc(opts.aria) + '"' : '') + '>';
    if (opts.suffix) return '<div class="ac-affix suffix"><span aria-hidden="true">' + opts.suffix + '</span>' + inp + '</div>';
    return inp;
  }
  function moneyInput(bind, value, aria) {
    var v = pos(value);
    return '<div class="ac-affix"><span aria-hidden="true">R$</span><input class="ac-input" type="text" inputmode="decimal" autocomplete="off" data-money="1" data-min="0"' +
      ' data-bind="' + bind + '" value="' + (v ? moneyPlain(v) : '') + '" placeholder="0,00"' + (aria ? ' aria-label="' + esc(aria) + '"' : '') + '></div>';
  }
  function txtInput(bind, value, placeholder, extra) {
    return '<input class="ac-input" type="text" data-bind="' + bind + '" value="' + esc(value) + '" placeholder="' + esc(placeholder || '') + '"' + (extra || '') + '>';
  }
  // Campo numérico com rótulo, ajuda e aviso de valor fora do esperado
  function numField(label, helpKey, bind, value, opts, fieldStyle) {
    return '<div class="ac-field"' + (fieldStyle ? ' style="' + fieldStyle + '"' : '') + '><label class="ac-label">' + label + (helpKey ? ' ' + help(helpKey) : '') + '</label>' +
      numInput(bind, value, opts) + '<div class="ac-warn" data-warn="' + bind + '" role="alert"></div></div>';
  }

  function validateField(el) {
    if (!el || el.dataset.min == null) return;
    var raw = el.value;
    var v = el.dataset.money ? parseMoney(raw) : num(raw);
    var min = el.dataset.min !== undefined ? parseFloat(el.dataset.min) : null;
    var max = el.dataset.max !== undefined ? parseFloat(el.dataset.max) : null;
    var neg = /-/.test(raw);
    var bad = raw !== '' && (neg || (min != null && v < min) || (max != null && v > max));
    el.classList.toggle('ac-invalid', bad);
    el.setAttribute('aria-invalid', bad ? 'true' : 'false');
    var w = S.root.querySelector('[data-warn="' + el.getAttribute('data-bind') + '"]');
    if (w) w.textContent = bad ? (neg || v < min ? 'Use um valor positivo.' : 'Confira este valor: o esperado é até ' + fmtN(max) + '.') : '';
  }
  function validateAll() { S.root.querySelectorAll('[data-min]').forEach(validateField); }

  // Linha de serviço: nome em cima; horas, dica, valor e remover embaixo
  function itemRow(base, it, list, i, outKey, hint, locked) {
    return '<div class="ac-item">' + txtInput(base + '.nome', it.nome, 'Descrição do serviço', ' aria-label="Serviço"') +
      '<div class="ac-item-row">' + numInput(base + '.horas', it.horas, { suffix: 'h', aria: 'Horas a cobrar', max: 2000 }) +
      '<div class="ac-hint">' + esc(hint) + '</div>' +
      '<div class="ac-li-val" data-out="' + outKey + '" data-i="' + i + '"></div>' +
      (locked ? '' : '<button type="button" class="ac-icon-btn" title="Remover" aria-label="Remover serviço" data-act="del" data-list="' + list + '" data-i="' + i + '">' + icon('trash-2') + '</button>') +
      '</div></div>';
  }

  function itemHint(servicoId) {
    var ref = S.profile.servicos.filter(function (s) { return s.id === servicoId; })[0];
    if (!ref) return 'Serviço personalizado';
    return 'Padrão ' + fmtN(num(ref.horas)) + ' h · referência ' + fmtN(num(ref.min)) + '–' + fmtN(num(ref.max)) + ' h';
  }

  function categorias(list) {
    var seen = {}, out = [];
    (list || S.profile.servicos).forEach(function (s) { var c = s.categoria || 'Outros'; if (!seen[c]) { seen[c] = 1; out.push(c); } });
    return out;
  }

  function servicoSelect(act) {
    var p = S.profile;
    var html = '<select class="ac-select" data-act-change="' + act + '" aria-label="Adicionar serviço"><option value="">+ Adicionar um dos meus serviços…</option>' +
      '<option value="__avulso">✎ Serviço personalizado (digitar)</option>';
    categorias().forEach(function (cat) {
      html += '<optgroup label="' + esc(cat) + '">';
      p.servicos.forEach(function (s) {
        if ((s.categoria || 'Outros') === cat) html += '<option value="' + esc(s.id) + '">' + esc(s.nome) + ' (' + fmtN(num(s.horas)) + ' h)</option>';
      });
      html += '</optgroup>';
    });
    return html + '</select>';
  }

  // Aviso quando o preço da hora ainda está zerado
  function horaZeradaBanner() {
    if (calcHora(S.profile).precoHora > 0) return '';
    return '<div class="ac-banner warn" role="alert">' + icon('alert-triangle') + '<div><strong>Sua hora ainda está em R$ 0,00.</strong> Preencha seus custos e horas em Minha Hora para os valores aparecerem.' +
      '<br><button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="tab" data-tab="hora">' + icon('clock') + 'Ir para Minha Hora</button></div></div>';
  }

  // ---------------------------------------------------------------------------
  // Checklist de primeiros passos
  // ---------------------------------------------------------------------------
  function checklistSteps() {
    var p = S.profile;
    return [
      ['hora', 'Calcule sua hora', calcHora(p).precoHora > 0],
      ['servicos', 'Revise seus serviços', !!p.flags.servicosConfirmados],
      // Antes contava como feito só porque o nome vem preenchido com o nome do aluno
      ['marca', 'Cadastre sua marca', !!p.flags.marcaSalva],
      ['orcamento', 'Finalize o primeiro orçamento', S.orcs.some(function (r) { return !isRascunho(r.dados); })]
    ];
  }
  function renderChecklist() {
    if (!S.profile || S.profile.flags.checklistOculto) return '';
    var steps = checklistSteps();
    var done = steps.filter(function (s) { return s[2]; }).length;
    if (done === steps.length) return '';
    return '<section class="ac-checklist" aria-label="Primeiros passos"><div class="ac-checklist-head"><strong>Primeiros passos</strong><span>' + done + ' de ' + steps.length + ' concluídos</span>' +
      '<button type="button" class="ac-link" data-act="hideChecklist">Ocultar</button></div><ol>' +
      steps.map(function (s, i) {
        return '<li class="' + (s[2] ? 'done' : '') + '"><button type="button" data-act="tab" data-tab="' + s[0] + '"><span class="ac-step-n">' + (s[2] ? '✓' : (i + 1)) + '</span>' + s[1] + '</button></li>';
      }).join('') + '</ol></section>';
  }

  // ---------------------------------------------------------------------------
  // Aba: Minha Hora
  // ---------------------------------------------------------------------------
  function tabHora() {
    var p = S.profile;
    var h = calcHora(p);
    var banner = h.totalCustos === 0 ?
      '<div class="ac-banner">' + icon('sparkles') + '<div><strong>Comece por aqui.</strong> Preencha seus custos fixos mensais, suas horas produtivas e a margem de lucro. A calculadora encontra o preço justo da sua hora e usa esse valor em todo o resto.' +
      '<br><button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="exemplo">' + icon('wand-2') + 'Preencher com o exemplo da planilha</button></div></div>' : '';

    return banner + guide('Como funciona esta aba', [
      '<p>Aqui você informa seus <strong>custos fixos do mês</strong>, quanto tempo <strong>realmente consegue trabalhar</strong> e a <strong>margem de lucro</strong> que deseja. Com isso calculamos o preço justo da sua hora.</p>',
      '<h4>O que NÃO entra aqui (varia por proposta)</h4><ul><li>Certidões e emolumentos</li><li>Deslocamento de uma visita específica</li><li>Impressões de um caso</li><li>Honorários de terceiros (topógrafo, engenheiro)</li><li>Taxas de plataforma e impostos do pagamento</li></ul><p>Esses custos entram no orçamento, em <strong>Despesas do caso</strong>.</p>',
      '<h4>Regra de ouro</h4><p>Se você está muito no operacional, coloque menos horas; se está focado só em execução, pode colocar mais.</p>',
      '<h4>Erros comuns</h4><ul><li>Misturar custos variáveis aqui.</li><li>Superestimar horas: 40 h/semana quando só vende 15–20 h deixa a sua hora barata demais.</li><li>Zerar a margem: você fica sem fôlego para ociosidade e imprevistos.</li></ul>'
    ].join('')) +
    '<div class="ac-grid"><div class="ac-stack">' +
      '<section class="ac-card"><h3 class="ac-card-title">' + icon('wallet') + 'Custos mensais ' + help('custos') + '</h3>' +
      '<p class="ac-card-sub">Gastos que existem todo mês, mesmo sem nenhum serviço.</p>' +
      '<div class="ac-li-head" style="grid-template-columns:minmax(0,1fr) 150px 36px"><span>Item</span><span>Valor mensal</span><span></span></div>' +
      '<div class="ac-list">' + p.custos.map(function (c, i) {
        return '<div class="ac-li">' + txtInput('p.custos.' + i + '.nome', c.nome, 'Descrição do custo', ' aria-label="Descrição do custo"') +
          moneyInput('p.custos.' + i + '.valor', c.valor, 'Valor mensal de ' + (c.nome || 'custo')) +
          '<button type="button" class="ac-icon-btn" title="Remover" aria-label="Remover custo" data-act="del" data-list="custos" data-i="' + i + '">' + icon('trash-2') + '</button></div>';
      }).join('') + '</div>' +
      '<div class="ac-actions" style="justify-content:space-between;align-items:center">' +
      '<button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="add" data-list="custos">' + icon('plus') + 'Adicionar custo</button>' +
      '<div><span style="color:var(--text-muted)">Total: </span><strong data-out="totalCustos" style="font-size:1.15rem;color:var(--white)"></strong></div></div></section>' +

      '<section class="ac-card"><h3 class="ac-card-title">' + icon('hourglass') + 'Tempo disponível</h3>' +
      '<p class="ac-card-sub">Horas produtivas: tempo que você consegue vender, não reunião interna nem WhatsApp.</p>' +
      '<div class="ac-row3">' +
        numField('Horas por semana', 'horasSemana', 'p.horasSemana', p.horasSemana, { suffix: 'h', max: 80 }) +
        numField('Semanas no mês', 'semanasMes', 'p.semanasMes', p.semanasMes, { max: 5 }) +
        '<div class="ac-field"><span class="ac-label">Horas no mês ' + help('horasMes') + '</span><div class="ac-input ac-readonly" data-out="horasMes"></div></div>' +
      '</div></section>' +

      '<section class="ac-card"><h3 class="ac-card-title">' + icon('trending-up') + 'Margem de lucro</h3>' +
      '<p class="ac-card-sub">Percentual sobre o seu custo por hora. Para cobrir ociosidade e imprevistos, aumente a margem.</p>' +
      numField('Margem desejada', 'margem', 'p.margem', p.margem, { suffix: '%', max: 300 }, 'max-width:240px;margin-bottom:0') + '</section>' +
    '</div>' +

    '<div class="ac-stack ac-sticky"><section class="ac-card gold"><h3 class="ac-card-title">' + icon('calculator') + 'Sua hora</h3>' +
      '<div class="ac-kpi"><div class="ac-kpi-label">Total de custos fixos</div><div class="ac-kpi-value" data-out="totalCustos"></div></div>' +
      '<div class="ac-kpi"><div class="ac-kpi-label">Horas produtivas no mês</div><div class="ac-kpi-value" data-out="horasMesH"></div></div>' +
      '<div class="ac-kpi"><div class="ac-kpi-label">Custo por hora (sem lucro) ' + help('custoHora') + '</div><div class="ac-kpi-value" data-out="custoHora"></div></div>' +
      '<div class="ac-kpi big"><div class="ac-kpi-label">Preço da sua hora (com lucro) ' + help('precoHora') + '</div><div class="ac-kpi-value" data-out="precoHora"></div></div>' +
      '<p class="ac-card-sub" style="margin:14px 0 0">Esse valor precifica seus serviços, o Cálculo Rápido e os rascunhos de orçamento.</p>' +
      '<div class="ac-actions"><button type="button" class="ac-btn ac-btn-primary" data-act="newOrc">' + icon('file-plus') + 'Montar um orçamento</button></div>' +
    '</section></div></div>';
  }

  // ---------------------------------------------------------------------------
  // Aba: Serviços
  // ---------------------------------------------------------------------------
  function svHoursInput(bind, value, aria) { return numInput(bind, value, { suffix: 'h', aria: aria, cls: 'num', max: 2000 }); }

  function tabServicos() {
    var editing = !!S.svDraft;
    var list = editing ? S.svDraft : S.profile.servicos;
    var cats = categorias(list);
    var cols = editing ? 6 : 5;
    var rows = '';
    cats.forEach(function (cat) {
      rows += '<tr class="ac-cat"><td colspan="' + cols + '">' + esc(cat) + '</td></tr>';
      list.forEach(function (s, i) {
        if ((s.categoria || 'Outros') !== cat) return;
        var b = 'sv.' + i;
        if (editing) {
          rows += '<tr>' +
            '<td class="ac-sv-name">' + txtInput(b + '.nome', s.nome, 'Nome do serviço', ' aria-label="Nome do serviço"') +
              '<div class="ac-sv-meta"><input class="ac-input" type="text" list="ac-cats" data-bind="' + b + '.categoria" data-redraw="1" value="' + esc(s.categoria) + '" aria-label="Categoria" title="Categoria" placeholder="Categoria">' +
              txtInput(b + '.obs', s.obs, 'Observações', ' aria-label="Observações" title="Observações"') + '</div></td>' +
            '<td class="ac-sv-hours">' + svHoursInput(b + '.horas', s.horas, 'Horas a cobrar') + '</td>' +
            '<td class="ac-sv-ref">' + svHoursInput(b + '.min', s.min, 'Referência mínima de horas') + '</td>' +
            '<td class="ac-sv-ref">' + svHoursInput(b + '.max', s.max, 'Referência máxima de horas') + '</td>' +
            '<td class="money"><span data-out="svVal" data-i="' + i + '"></span><div class="muted" data-out="svRange" data-i="' + i + '"></div></td>' +
            '<td><button type="button" class="ac-icon-btn" title="Remover" aria-label="Remover serviço" data-act="del" data-list="servicos" data-i="' + i + '">' + icon('trash-2') + '</button></td></tr>';
        } else {
          rows += '<tr>' +
            '<td class="ac-sv-name"><strong class="ac-sv-title">' + esc(s.nome || 'Sem nome') + '</strong>' + (s.obs ? '<div class="muted">' + esc(s.obs) + '</div>' : '') + '</td>' +
            '<td class="ac-sv-hours"><span class="ac-hours-pill">' + fmtN(num(s.horas)) + ' h</span></td>' +
            '<td class="ac-sv-ref"><span class="ac-ref">' + fmtN(num(s.min)) + ' h</span></td>' +
            '<td class="ac-sv-ref"><span class="ac-ref">' + fmtN(num(s.max)) + ' h</span></td>' +
            '<td class="money"><span data-out="svVal" data-i="' + i + '"></span><div class="muted" data-out="svRange" data-i="' + i + '"></div></td></tr>';
        }
      });
    });

    var actions = editing ?
      '<button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="add" data-list="servicos">' + icon('plus') + 'Novo serviço</button>' +
      '<button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="cancelSv">' + icon('x') + 'Cancelar</button>' +
      '<button type="button" class="ac-btn ac-btn-primary ac-btn-sm" data-act="saveSv">' + icon('save') + 'Salvar serviços</button>'
      :
      '<button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="restore">' + icon('rotate-ccw') + 'Restaurar lista padrão</button>' +
      '<button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="add" data-list="servicos">' + icon('plus') + 'Novo serviço</button>' +
      '<button type="button" class="ac-btn ac-btn-primary ac-btn-sm" data-act="editSv">' + icon('pencil') + 'Editar serviços</button>';

    var revisar = !editing && !S.profile.flags.servicosConfirmados ?
      '<div class="ac-banner">' + icon('list-checks') + '<div><strong>Revise seus serviços.</strong> Confira se as horas a cobrar fazem sentido para a sua realidade. Ajuste em <strong>Editar serviços</strong> ou, se a lista já estiver boa, confirme.' +
      '<div class="ac-actions" style="margin-top:10px"><button type="button" class="ac-btn ac-btn-primary ac-btn-sm" data-act="confirmSv">' + icon('check') + 'Revisei, a lista está certa</button>' +
      '<button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="editSv">' + icon('pencil') + 'Editar serviços</button></div></div></div>' : '';

    return horaZeradaBanner() + revisar + guide('Como funciona esta aba', [
      '<p>É a sua tabela de serviços. Para cada um você define as <strong>horas a cobrar</strong>. Esse número é multiplicado pelo valor da sua hora e é ele que entra no Orçamento e no Cálculo Rápido.</p>',
      '<p><strong>Mín. e Máx.</strong> são apenas <strong>referências</strong> de quanto o serviço costuma variar (um caso simples ou um caso complexo). Não entram no cálculo, só ajudam você a ajustar as horas de cada proposta.</p>',
      '<h4>Nas horas a cobrar, inclua</h4><ul><li>Atendimento ao cliente e reuniões</li><li>Pesquisa e análise documental</li><li>Contatos com cartório/prefeitura</li><li>Preparação de documentos, protocolos e acompanhamentos</li></ul>',
      '<h4>Não inclua</h4><ul><li>Horas que dependem de terceiros</li><li>Retrabalho por falta de documentação (são exceções)</li></ul>',
      '<h4>Revise periodicamente</h4><p>Ganhou experiência e ficou mais rápido? Os serviços ficaram mais burocráticos? Clique em <strong>Editar serviços</strong>, ajuste e salve.</p>'
    ].join('')) +
    '<section class="ac-card' + (editing ? ' gold' : '') + '"><div class="ac-toolbar"><div><h3 class="ac-card-title" style="margin:0">' + icon('list-checks') + 'Meus serviços ' + help('horasCobrar') + '</h3>' +
      '<p class="ac-card-sub" style="margin:4px 0 0">' + (editing ? '<strong style="color:var(--gold)">Modo edição.</strong> Altere o que precisar e clique em <strong>Salvar serviços</strong>.' : 'Valores calculados com a sua hora de <strong data-out="precoHora"></strong>.') + '</p></div>' +
      '<div class="ac-actions" style="margin:0">' + actions + '</div></div>' +
      '<div class="ac-legend"><span><span class="ac-hours-pill">h</span> <strong>Horas a cobrar</strong>: entram no cálculo do valor</span><span><span class="ac-ref">h</span> <strong>Mín. / Máx.</strong>: só referência de variação</span></div>' +
      '<datalist id="ac-cats">' + cats.map(function (c) { return '<option value="' + esc(c) + '">'; }).join('') + '</datalist>' +
      (list.length ? '<div class="ac-table-wrap"><table class="ac-table' + (editing ? '' : ' view') + '"><thead><tr><th scope="col">Serviço</th>' +
        '<th scope="col" class="c">Horas a cobrar</th><th scope="col" class="c">Mín. (ref.)</th><th scope="col" class="c">Máx. (ref.)</th>' +
        '<th scope="col" style="text-align:right">Valor do serviço</th>' + (editing ? '<th><span class="ac-sr">Ações</span></th>' : '') + '</tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<div class="ac-empty">Nenhum serviço cadastrado. Clique em <strong>Novo serviço</strong> ou restaure a lista padrão.</div>') +
      (editing ? '<div class="ac-actions" style="justify-content:flex-end"><button type="button" class="ac-btn ac-btn-ghost" data-act="cancelSv">' + icon('x') + 'Cancelar</button><button type="button" class="ac-btn ac-btn-primary" data-act="saveSv">' + icon('save') + 'Salvar serviços</button></div>' : '') +
    '</section>';
  }

  // ---------------------------------------------------------------------------
  // Aba: Cálculo Rápido
  // ---------------------------------------------------------------------------
  function tabRapido() {
    var p = S.profile;
    return horaZeradaBanner() + guide('Quando usar o Cálculo Rápido', [
      '<p>Uma calculadora simples: <strong>horas × preço da sua hora</strong>. Ideal para averbações, consultorias pontuais, um documento específico ou atendimentos isolados, e para montar sua tabela interna de valores.</p>',
      '<h4>Nas horas, inclua</h4><ul><li>Análise e estudo do caso</li><li>Atendimento (reuniões, ligações, mensagens)</li><li>Preparação de documentos e deslocamentos necessários</li></ul>',
      '<h4>Não use para</h4><p>Casos com certidões/cartório, deslocamentos extensos, terceiros (engenheiros, topógrafos, despachantes) ou análises técnicas profundas. Para esses, monte um <strong>orçamento</strong>.</p>',
      '<h4>Como ler o resultado</h4><ul><li>Cobrar <strong>menos</strong>: você reduz a margem ou tem prejuízo.</li><li>Cobrar <strong>igual</strong>: cobre custos e lucro planejados.</li><li>Cobrar <strong>acima</strong>: margem adicional.</li></ul>'
    ].join('')) +
    '<div class="ac-grid"><section class="ac-card"><h3 class="ac-card-title">' + icon('zap') + 'Simular serviços</h3>' +
      '<p class="ac-card-sub">Escolha um dos seus serviços (ou um personalizado), ajuste as horas e veja o valor mínimo recomendado.</p>' +
      '<div class="ac-list">' + (p.rapido.length ? p.rapido.map(function (r, i) {
        return itemRow('p.rapido.' + i, r, 'rapido', i, 'rpVal', itemHint(r.servicoId));
      }).join('') : '<div class="ac-empty">Adicione um serviço abaixo para simular.</div>') + '</div>' +
      '<div style="margin-top:14px">' + servicoSelect('addRapido') + '</div></section>' +
    '<div class="ac-stack ac-sticky"><section class="ac-card gold"><h3 class="ac-card-title">' + icon('calculator') + 'Resultado</h3>' +
      '<div class="ac-kpi"><div class="ac-kpi-label">Preço da sua hora ' + help('precoHora') + '</div><div class="ac-kpi-value" data-out="precoHora"></div></div>' +
      '<div class="ac-kpi"><div class="ac-kpi-label">Horas somadas</div><div class="ac-kpi-value" data-out="rpHoras"></div></div>' +
      '<div class="ac-kpi big"><div class="ac-kpi-label">Valor total</div><div class="ac-kpi-value" data-out="rpTotal"></div></div>' +
      '<p class="ac-card-sub" style="margin:14px 0 0">Para alterar o preço da hora, ajuste seus custos e margem em <a href="#" data-act="tab" data-tab="hora" style="color:var(--gold)">Minha Hora</a>.</p>' +
    '</section></div></div>';
  }

  // ---------------------------------------------------------------------------
  // Aba: Orçamentos – lista
  // ---------------------------------------------------------------------------
  function totalDaLinha(r) {
    var o = r.dados || {};
    if (!o.itens) return num(r.total);
    return calcOrc(o, precoDoOrc(o)).bruto;
  }

  function renderSavedList() {
    var q = (S.busca || '').trim().toLowerCase();
    var match = function (r) { return !q || (r.cliente || '').toLowerCase().indexOf(q) >= 0 || ((r.dados && r.dados.documento) || '').toLowerCase().indexOf(q) >= 0; };
    var rascunhos = S.orcs.filter(function (r) { return isRascunho(r.dados) && match(r); });
    var finais = S.orcs.filter(function (r) { return !isRascunho(r.dados) && match(r); });
    if (q && !rascunhos.length && !finais.length) return '<div class="ac-empty">Nenhum orçamento encontrado para "' + esc(S.busca) + '".</div>';
    return savedGroup('r', 'Rascunhos', 'file-pen-line', rascunhos, 'Nenhum rascunho. Todo orçamento novo fica aqui até ser finalizado.') +
      savedGroup('f', 'Finalizados', 'file-check-2', finais, 'Nenhum orçamento finalizado. Use <strong>Finalizar orçamento</strong> ou <strong>Baixar proposta em PDF</strong>.');
  }

  function savedGroup(key, titulo, ic, lista, vazio) {
    var lim = S.limite[key];
    var resto = lista.length - lim;
    return '<div class="ac-saved-group"><h4 class="ac-saved-head">' + icon(ic) + titulo + ' <span class="ac-count">' + lista.length + '</span></h4>' +
      (lista.length ? '<div class="ac-saved">' + lista.slice(0, lim).map(savedItem).join('') + '</div>' : '<div class="ac-empty" style="padding:10px 0;text-align:left">' + vazio + '</div>') +
      (resto > 0 ? '<button type="button" class="ac-btn ac-btn-ghost ac-btn-sm ac-more-btn" data-act="mais" data-key="' + key + '">Mostrar mais ' + Math.min(resto, 20) + ' de ' + resto + '</button>' : '') +
      '</div>';
  }

  function savedItem(r) {
    var o = r.dados || {};
    var draft = isRascunho(o);
    var info = draft ? 'Atualizado em ' + fmtDate(r.updated_at) : 'Finalizado em ' + fmtDate(o.finalizadoEm || r.updated_at);
    return '<div class="ac-saved-item' + (draft ? ' draft' : '') + '">' +
      '<div class="ac-saved-main" data-act="openOrc" data-id="' + esc(r.id) + '" role="button" tabindex="0"><strong>' + esc(r.cliente || 'Sem nome de cliente') + '</strong><span>' +
        (draft ? '<em class="ac-badge-draft">Rascunho</em> ' : '<em class="ac-badge-final">Finalizado</em> ') + info + '</span></div>' +
      '<div class="ac-saved-total">' + money(totalDaLinha(r)) + '</div>' +
      '<div class="ac-saved-actions">' +
      '<button type="button" class="ac-icon-btn ac-act-gold" title="' + (draft ? 'Editar' : 'Abrir') + '" aria-label="' + (draft ? 'Editar' : 'Abrir') + ' orçamento de ' + esc(r.cliente || 'sem nome') + '" data-act="openOrc" data-id="' + esc(r.id) + '">' + icon(draft ? 'pencil' : 'eye') + '</button>' +
      '<button type="button" class="ac-icon-btn ac-act-gold" title="Baixar proposta em PDF" aria-label="Baixar proposta em PDF" data-act="pdfOrc" data-id="' + esc(r.id) + '">' + icon('file-down') + '</button>' +
      '<button type="button" class="ac-icon-btn ac-act-gold" title="Duplicar e editar" aria-label="Duplicar e editar" data-act="dupOrc" data-id="' + esc(r.id) + '">' + icon('copy') + '</button>' +
      '<button type="button" class="ac-icon-btn" title="Excluir" aria-label="Excluir orçamento" data-act="delOrc" data-id="' + esc(r.id) + '">' + icon('trash-2') + '</button></div></div>';
  }

  function tabLista() {
    return guide('Como funcionam os orçamentos', [
      '<p><strong>Orçamento</strong> é o seu trabalho interno: serviços, despesas, desconto, taxas e a meta de quanto quer <strong>receber líquido</strong>. <strong>Proposta</strong> é o PDF que você envia ao cliente.</p>',
      '<h4>Rascunho → Finalizado</h4><ul><li>Todo orçamento novo é um <strong>rascunho</strong> e é salvo automaticamente enquanto você edita.</li><li>Ao <strong>finalizar</strong> (ou baixar a proposta em PDF), os valores ficam <strong>travados</strong>: mesmo que você mude seus custos depois, a proposta continua igual à que o cliente recebeu.</li><li>Precisa mudar algo? Use <strong>Duplicar e editar</strong>, ou reabra como rascunho.</li></ul>',
      '<h4>Use sempre que houver</h4><ul><li>Mais de um procedimento</li><li>Custos de terceiros, deslocamentos ou diligências</li><li>Certidões e taxas variáveis</li><li>Envio de proposta formal ao cliente</li></ul>'
    ].join('')) +
    '<section class="ac-card"><div class="ac-toolbar"><h3 class="ac-card-title" style="margin:0">' + icon('folder-open') + 'Orçamentos</h3>' +
      '<button type="button" class="ac-btn ac-btn-primary ac-btn-sm" data-act="newOrc">' + icon('file-plus') + 'Novo orçamento</button></div>' +
      (S.orcs.length > 3 ? '<div class="ac-search">' + icon('search') + '<input class="ac-input" type="search" data-act-input="busca" value="' + esc(S.busca) + '" placeholder="Buscar por cliente ou CPF/CNPJ" aria-label="Buscar orçamento"></div>' : '') +
      '<div data-region="saved">' + renderSavedList() + '</div></section>';
  }

  // ---------------------------------------------------------------------------
  // Aba: Orçamentos – editor
  // ---------------------------------------------------------------------------
  function tabEditor() {
    var o = S.orc;
    var locked = !isRascunho(o);
    var maisAberto = !!(o.documento || o.email || o.telefone || o.endereco);
    var lockBanner = locked ?
      '<div class="ac-banner lock" role="note">' + icon('lock') + '<div><strong>Orçamento finalizado em ' + fmtDate(o.finalizadoEm || new Date()) + '.</strong> Os valores estão travados com a hora de ' + money(precoDoOrc(o)) + ', para a proposta não mudar depois de enviada.' +
        '<div class="ac-actions" style="margin-top:10px"><button type="button" class="ac-btn ac-btn-primary ac-btn-sm" data-act="dupOrc" data-id="' + esc(o.id || '') + '">' + icon('copy') + 'Duplicar e editar</button>' +
        '<button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="reopenOrc">' + icon('unlock') + 'Reabrir como rascunho</button></div></div></div>' : '';

    return '<div class="ac-editor-bar"><button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="backList">' + icon('arrow-left') + 'Orçamentos</button>' +
      '<div class="ac-editor-title"><span data-out="edLabel">' + (locked ? 'Visualizando' : o.id ? 'Editando' : 'Novo orçamento') + '</span><strong data-out="edTitle"></strong></div>' +
      '<span data-out="edBadge"></span></div>' +
      (locked ? '' : horaZeradaBanner()) + lockBanner +
    '<div class="ac-editor' + (locked ? ' locked' : '') + '">' +
    '<div class="ac-grid"><div class="ac-stack">' +
      '<section class="ac-card"><h3 class="ac-card-title">' + icon('user') + 'Cliente</h3>' +
        '<div class="ac-field"><label class="ac-label">Nome do cliente / Razão Social</label>' + txtInput('o.cliente', o.cliente, 'Ex.: Maria da Silva ou Imobiliária X Ltda.', ' autocomplete="off"') + '</div>' +
        '<div class="ac-row2"><div class="ac-field"><label class="ac-label">Data de envio da proposta</label><input class="ac-input" type="date" data-bind="o.dataEnvio" value="' + esc(o.dataEnvio || '') + '"></div>' +
        numField('Validade da proposta', null, 'o.validadeDias', o.validadeDias, { suffix: 'dias', max: 365 }) + '</div>' +
        '<div class="ac-hint" style="margin:-6px 0 10px">Válida até <strong data-out="oValidade"></strong></div>' +
        '<details class="ac-more"' + (maisAberto ? ' open' : '') + '><summary>' + icon('plus') + 'Mais dados do cliente <span class="ac-opt">opcional</span></summary>' +
          '<div class="ac-row2" style="margin-top:12px">' +
            '<div class="ac-field"><label class="ac-label">CPF ou CNPJ</label>' + txtInput('o.documento', o.documento, '000.000.000-00', ' inputmode="numeric" autocomplete="off"') + '</div>' +
            '<div class="ac-field"><label class="ac-label">Telefone</label>' + txtInput('o.telefone', o.telefone, '(00) 00000-0000', ' inputmode="tel" autocomplete="off"') + '</div>' +
          '</div>' +
          '<div class="ac-field"><label class="ac-label">E-mail do cliente</label>' + txtInput('o.email', o.email, 'cliente@email.com', ' inputmode="email" autocomplete="off"') + '</div>' +
          '<div class="ac-field"><label class="ac-label">Endereço</label>' + txtInput('o.endereco', o.endereco, 'Rua, número, bairro, cidade/UF', ' autocomplete="off"') + '</div>' +
        '</details>' +
        '<div class="ac-field" style="margin:14px 0 0"><label class="ac-label">Imóvel / referência <span class="ac-opt">opcional</span></label>' + txtInput('o.descricao', o.descricao, 'Ex.: Casa na Rua X, matrícula 1234') + '</div>' +
      '</section>' +

      '<section class="ac-card"><h3 class="ac-card-title">' + icon('list-checks') + 'Serviços ' + help('horasCobrar') + '</h3>' +
        '<p class="ac-card-sub">Horas × <strong data-out="orcHora"></strong> (sua hora). Ajuste as horas se este caso for mais simples ou mais complexo.</p>' +
        '<div class="ac-list">' + (o.itens.length ? o.itens.map(function (it, i) {
          return itemRow('o.itens.' + i, it, 'itens', i, 'itVal', itemHint(it.servicoId), locked);
        }).join('') : '<div class="ac-empty" style="padding:12px 0">Nenhum serviço ainda. Escolha abaixo.</div>') + '</div>' +
        (locked ? '' : '<div style="margin-top:14px">' + servicoSelect('addItem') + '</div>') + '</section>' +

      '<section class="ac-card"><h3 class="ac-card-title">' + icon('receipt') + 'Despesas do caso ' + help('despesas') + '</h3>' +
        '<p class="ac-card-sub">Despesas variáveis deste caso. Deixe em branco o que não se aplica: itens zerados não aparecem na proposta.</p>' +
        '<div class="ac-list">' + o.adicionais.map(function (a, i) {
          return '<div class="ac-li">' + txtInput('o.adicionais.' + i + '.desc', a.desc, 'Descrição', ' aria-label="Descrição da despesa"') +
            moneyInput('o.adicionais.' + i + '.valor', a.valor, 'Valor de ' + (a.desc || 'despesa')) +
            (locked ? '<span></span>' : '<button type="button" class="ac-icon-btn" title="Remover" aria-label="Remover despesa" data-act="del" data-list="adicionais" data-i="' + i + '">' + icon('trash-2') + '</button>') + '</div>';
        }).join('') + '</div>' +
        '<div class="ac-actions" style="justify-content:space-between;align-items:center">' + (locked ? '<span></span>' : '<button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="add" data-list="adicionais">' + icon('plus') + 'Adicionar despesa</button>') +
        '<div><span style="color:var(--text-muted)">Total: </span><strong data-out="oAdic" style="color:var(--white)"></strong></div></div></section>' +

      renderPagamentos(o, locked) +

      '<section class="ac-card"><h3 class="ac-card-title">' + icon('message-square-text') + 'Observações da proposta</h3>' +
        '<div class="ac-field" style="margin:0"><label class="ac-label ac-sr">Observações da proposta</label><textarea class="ac-textarea" data-bind="o.observacoes" placeholder="Ex.: Forma de pagamento: 50% na contratação e 50% na entrega. Não inclui emolumentos de cartório.">' + esc(o.observacoes) + '</textarea></div>' +
        '<label class="ac-check" style="margin-top:12px"><input type="checkbox" data-bind="o.mostrarHoras"' + (o.mostrarHoras ? ' checked' : '') + '> Mostrar as horas de cada serviço na proposta</label></section>' +
    '</div>' +

    '<div class="ac-stack ac-sticky"><section class="ac-card gold"><h3 class="ac-card-title">' + icon('calculator') + 'Resumo e lucro</h3>' +
      '<table class="ac-sum"><tbody>' +
        '<tr><td>Serviços</td><td data-out="oServ"></td></tr>' +
        '<tr><td>Despesas do caso</td><td data-out="oAdic"></td></tr>' +
        // Desconto geral só existe em orçamentos antigos (finalizados antes desta versão)
        (pos(o.desconto) > 0 ? '<tr><td>Desconto (' + fmtN(pos(o.desconto)) + '%)</td><td data-out="oDesc"></td></tr>' : '') +
        '<tr class="total"><td><span class="lbl">Valor da proposta ' + help('bruto') + '</span></td><td data-out="oBruto"></td></tr>' +
      '</tbody></table>' +
      '<p class="ac-hint" style="margin:6px 0 0">Quer dar desconto? Use o desconto da opção <strong>À vista</strong> ou da <strong>entrada</strong> em Formas de pagamento.</p>' +

      '<table class="ac-sum"><tbody><tr class="sep"><td colspan="2">Taxas e impostos · só você vê</td></tr></tbody></table>' +
      '<div class="ac-row2">' + numField('Plataforma', 'taxaPlataforma', 'o.taxaPlataforma', o.taxaPlataforma, { suffix: '%', max: 50 }, 'margin-bottom:8px') +
        numField('Impostos', 'impostos', 'o.impostos', o.impostos, { suffix: '%', max: 50 }, 'margin-bottom:8px') + '</div>' +
      '<table class="ac-sum"><tbody>' +
        '<tr><td><span class="lbl">Taxa total ' + help('taxaTotal') + '</span></td><td data-out="oTaxa"></td></tr>' +
        '<tr><td><span class="lbl">Fica com você ' + help('liquido') + '</span></td><td data-out="oLiquido" style="color:var(--gold)"></td></tr>' +
        '<tr class="sep"><td colspan="2">Meta de ganho</td></tr>' +
      '</tbody></table>' +
      '<div class="ac-field" style="margin-bottom:8px"><label class="ac-label">Quero receber líquido ' + help('meta') + '</label>' + moneyInput('o.metaLiquida', o.metaLiquida) + '</div>' +
      '<table class="ac-sum"><tbody>' +
        '<tr><td><span class="lbl">Para atingir sua meta, cobre ' + help('brutoNec') + '</span></td><td data-out="oBrutoNec"></td></tr>' +
      '</tbody></table>' +
      '<div data-out="verdict" aria-live="polite"></div>' +
    '</section>' +
    '<section class="ac-card ac-actions-card">' +
      '<div class="ac-orc-status" data-out="orcStatus" aria-live="polite"></div>' +
      (locked ? '' :
        '<div class="ac-actions ac-save-row">' +
          '<button type="button" class="ac-btn ac-btn-ghost" data-act="saveDraft">' + icon('file-pen-line') + 'Salvar rascunho</button>' +
          '<button type="button" class="ac-btn ac-btn-ghost" data-act="saveFinal">' + icon('lock') + 'Finalizar orçamento</button></div>') +
      '<div class="ac-actions ac-pdf-row">' +
        '<button type="button" class="ac-btn ac-btn-ghost" data-act="verPdf">' + icon('eye') + 'Visualizar proposta</button>' +
        '<button type="button" class="ac-btn ac-btn-primary" data-act="pdf">' + icon('file-down') + 'Baixar proposta em PDF</button></div>' +
      (locked ? '' : '<p class="ac-hint" style="text-align:center;margin-top:8px">Visualizar não finaliza nada. Ao baixar, o orçamento é finalizado.</p>') +
    '</section></div></div></div>';
  }

  // ---- Formas de pagamento (editor) ----
  function selectBind(bind, opts, value, aria, redraw) {
    return '<select class="ac-select" data-bind="' + bind + '"' + (redraw ? ' data-redraw="1"' : '') + ' aria-label="' + esc(aria) + '">' +
      opts.map(function (op) { return '<option value="' + esc(op[0]) + '"' + (String(op[0]) === String(value) ? ' selected' : '') + '>' + esc(op[1]) + '</option>'; }).join('') + '</select>';
  }
  function parcelasOpts(meio, misto) {
    var l = limitesParc(meio, misto), out = [];
    for (var n = l[0]; n <= l[1]; n++) out.push([n, n + 'x']);
    return out;
  }
  // Campos de parcelamento (usado em Parcelado e no restante do Entrada + parcelas)
  function camposParcela(b, pg) {
    var misto = pg.tipo === 'misto';
    pg.parcelas = nParcelas(pg); // ajusta se o meio mudou o limite
    return '<div class="ac-pag-grid">' +
      '<div class="ac-field"><label class="ac-label">' + (misto ? 'Restante em' : 'Meio') + '</label>' + selectBind(b + '.meio', MEIOS_PARC, pg.meio, 'Meio do parcelamento', true) + '</div>' +
      '<div class="ac-field"><label class="ac-label">Parcelas</label>' + selectBind(b + '.parcelas', parcelasOpts(pg.meio, misto), pg.parcelas, 'Quantidade de parcelas') + '</div>' +
      '<div class="ac-field"><label class="ac-label">Juros ' + help('juros') + '</label>' + selectBind(b + '.jurosModo', [['sem', 'Sem juros'], ['mensal', 'Juros ao mês'], ['total', 'Acréscimo total']], pg.jurosModo, 'Juros', true) + '</div>' +
      (pg.jurosModo === 'sem' ? '' : numField(pg.jurosModo === 'mensal' ? 'Taxa ao mês' : 'Acréscimo', null, b + '.juros', pg.juros, { suffix: pg.jurosModo === 'mensal' ? '% a.m.' : '%', max: pg.jurosModo === 'mensal' ? 15 : 60 })) +
      '</div>';
  }

  function renderPagamentos(o, locked) {
    var lista = o.pagamentos || [];
    var cards = lista.map(function (pg, i) {
      var b = 'o.pagamentos.' + i;
      var corpo;
      if (pg.tipo === 'avista') {
        corpo = '<div class="ac-pag-grid">' +
          '<div class="ac-field"><label class="ac-label">Meio</label>' + selectBind(b + '.meio', MEIOS_AVISTA, pg.meio, 'Meio de pagamento à vista') + '</div>' +
          numField('Desconto à vista', 'descontoAvista', b + '.desconto', pg.desconto, { suffix: '%', max: 50 }) + '</div>';
      } else if (pg.tipo === 'parcelado') {
        corpo = camposParcela(b, pg);
      } else {
        corpo = '<div class="ac-pag-sub">Entrada ' + help('entrada') + '</div><div class="ac-pag-grid">' +
          '<div class="ac-field"><label class="ac-label">Tipo de entrada</label>' + selectBind(b + '.entradaModo', [['pct', 'Percentual (%)'], ['valor', 'Valor (R$)']], pg.entradaModo, 'Tipo de entrada', true) + '</div>' +
          (pg.entradaModo === 'valor' ?
            '<div class="ac-field"><label class="ac-label">Valor da entrada</label>' + moneyInput(b + '.entrada', pg.entrada) + '</div>' :
            numField('Entrada', null, b + '.entrada', pg.entrada, { suffix: '%', max: 99 })) +
          '<div class="ac-field"><label class="ac-label">Entrada paga</label>' + selectBind(b + '.entradaMeio', MEIOS_AVISTA, pg.entradaMeio, 'Meio da entrada') + '</div>' +
          numField('Desconto na entrada', 'descontoEntrada', b + '.entradaDesconto', pg.entradaDesconto || 0, { suffix: '%', max: 50 }) + '</div>' +
          '<div class="ac-pag-sub">Restante parcelado</div>' + camposParcela(b, pg);
      }
      return '<div class="ac-pag">' +
        '<div class="ac-pag-head"><span class="ac-pag-n">Opção ' + (i + 1) + '</span><span class="ac-pag-tipo">' + TIPOS_PAG[pg.tipo] + '</span>' +
        (locked ? '' : '<button type="button" class="ac-icon-btn" title="Remover opção" aria-label="Remover opção ' + (i + 1) + '" data-act="del" data-list="pagamentos" data-i="' + i + '">' + icon('trash-2') + '</button>') + '</div>' +
        corpo + '<div class="ac-pag-res" data-out-html="pagRes" data-i="' + i + '" aria-live="polite"></div></div>';
    }).join('');

    var add = locked ? '' : (lista.length < MAX_PAGAMENTOS ?
      '<div class="ac-pag-add"><span>Adicionar opção:</span>' +
        '<button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="addPag" data-tipo="avista">' + icon('banknote') + 'À vista</button>' +
        '<button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="addPag" data-tipo="parcelado">' + icon('credit-card') + 'Parcelado</button>' +
        '<button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="addPag" data-tipo="misto">' + icon('split') + 'Entrada + parcelas</button></div>'
      : '<div class="ac-hint" style="margin-top:12px">Limite de ' + MAX_PAGAMENTOS + ' opções por proposta, para não confundir o cliente.</div>');

    return '<section class="ac-card"><h3 class="ac-card-title">' + icon('wallet-cards') + 'Formas de pagamento ' + help('pagamento') + '</h3>' +
      '<p class="ac-card-sub">Ofereça até ' + MAX_PAGAMENTOS + ' opções ao cliente. Cada uma mostra quanto ele paga no total; o valor da proposta não muda. Para premiar quem paga à vista, use o desconto da opção <strong>À vista</strong>.</p>' +
      (lista.length ? '<div class="ac-list">' + cards + '</div>' : '<div class="ac-empty" style="padding:12px 0">Nenhuma forma de pagamento. Sem ela, a proposta sai sem condições de pagamento.</div>') +
      add +
      (locked || !lista.length ? '' : '<div class="ac-actions" style="justify-content:flex-end;margin-top:12px"><button type="button" class="ac-link" data-act="pagPadrao">Usar estas opções nos próximos orçamentos</button></div>') +
      '</section>';
  }

  function pagResHtml(pg, r, c, taxa) {
    var dif = r.total - r.base;
    var difTxt = Math.abs(dif) < 0.005 ? 'Igual ao valor da proposta' :
      dif > 0 ? '+ ' + money(dif) + ' de juros para o cliente' : '− ' + money(-dif) + ' de desconto';
    var linhas = '<strong>' + esc(descPag(pg, r)) + '</strong>' +
      '<span>Total para o cliente: <b>' + money(r.total) + '</b> · ' + difTxt + '</span>';
    if (pg.tipo !== 'avista' && pg.meio === 'cartao' && !r.comJuros && r.n > 1)
      linhas += '<span class="ac-pag-tip">Sem juros, a taxa do cartão sai do seu bolso. Confira o campo Plataforma no Resumo.</span>';
    if (pg.tipo === 'misto' && pg.entradaModo === 'valor' && pos(pg.entrada) > r.base && r.base > 0)
      linhas += '<span class="ac-pag-warn">A entrada é maior que o valor da proposta.</span>';
    if (c.meta > 0 && c.valido) {
      var liq = r.total * (1 - taxa);
      if (liq < c.meta - 0.005) linhas += '<span class="ac-pag-warn">Nesta opção você recebe cerca de ' + money(liq) + ' líquidos, abaixo da sua meta de ' + money(c.meta) + '.</span>';
    }
    return linhas;
  }

  // ---------------------------------------------------------------------------
  // Aba: Minha Marca
  // ---------------------------------------------------------------------------
  var MARCA_CAMPOS = [
    ['nome', 'Seu nome ou escritório', 'Ex.: Ana Souza Regularização'],
    ['profissao', 'Profissão / título', 'Ex.: Advogada · Especialista em regularização'],
    ['registro', 'Registro profissional', 'Ex.: OAB/SP 123.456'],
    ['cidade', 'Cidade / UF', 'Ex.: Campinas/SP'],
    ['telefone', 'Telefone / WhatsApp', '(00) 00000-0000'],
    ['email', 'E-mail', 'contato@seudominio.com.br'],
    ['site', 'Site ou Instagram', '@seuperfil']
  ];

  function marcaVazia(m) {
    return !MARCA_CAMPOS.some(function (c) { return (m[c[0]] || '').trim(); }) && !m.logo;
  }

  function tabMarca() {
    if (!S.mkDraft && marcaVazia(S.profile.marca)) S.mkDraft = clone(S.profile.marca);
    var editing = !!S.mkDraft;
    var m = editing ? S.mkDraft : S.profile.marca;
    var body;
    if (editing) {
      body = '<div class="ac-field"><span class="ac-label">Logo</span><div class="ac-logo-box"><div class="ac-logo-prev">' +
          (m.logo ? '<img src="' + esc(m.logo) + '" alt="Seu logo">' : 'Sem logo') + '</div><div class="ac-actions" style="margin:0">' +
          '<label class="ac-btn ac-btn-ghost ac-btn-sm" style="cursor:pointer">' + icon('upload') + 'Enviar imagem<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" data-act-change="logo" class="ac-sr"></label>' +
          (m.logo ? '<button type="button" class="ac-btn ac-btn-ghost ac-btn-sm" data-act="rmLogo">' + icon('x') + 'Remover</button>' : '') +
          '</div></div><div class="ac-hint">PNG ou JPG, de preferência com fundo transparente ou branco.</div></div>' +
        '<div class="ac-row2">' + MARCA_CAMPOS.slice(0, 6).map(function (c) {
          return '<div class="ac-field"><label class="ac-label">' + c[1] + '</label>' + txtInput('mk.' + c[0], m[c[0]], c[2]) + '</div>';
        }).join('') + '</div>' +
        '<div class="ac-field"><label class="ac-label">' + MARCA_CAMPOS[6][1] + '</label>' + txtInput('mk.site', m.site, MARCA_CAMPOS[6][2]) + '</div>' +
        '<div class="ac-actions" style="justify-content:flex-end">' +
          (marcaVazia(S.profile.marca) ? '' : '<button type="button" class="ac-btn ac-btn-ghost" data-act="cancelMarca">' + icon('x') + 'Cancelar</button>') +
          '<button type="button" class="ac-btn ac-btn-primary" data-act="saveMarca">' + icon('save') + 'Salvar dados</button></div>';
    } else {
      body = '<dl class="ac-dl">' +
          '<div><dt>Logo</dt><dd>' + (m.logo ? '<span class="ac-logo-prev" style="width:110px;height:64px"><img src="' + esc(m.logo) + '" alt="Seu logo"></span>' : '<span class="ac-empty-val">Sem logo</span>') + '</dd></div>' +
          MARCA_CAMPOS.map(function (c) {
            var v = (m[c[0]] || '').trim();
            return '<div><dt>' + c[1] + '</dt><dd>' + (v ? esc(v) : '<span class="ac-empty-val">Não informado</span>') + '</dd></div>';
          }).join('') + '</dl>' +
        '<div class="ac-actions" style="justify-content:flex-end"><button type="button" class="ac-btn ac-btn-primary" data-act="editMarca">' + icon('pencil') + 'Editar dados</button></div>';
    }

    return '<div class="ac-grid"><section class="ac-card' + (editing ? ' gold' : '') + '"><h3 class="ac-card-title">' + icon('badge-check') + 'Dados que aparecem na sua proposta</h3>' +
      '<p class="ac-card-sub">' + (editing ? '<strong style="color:var(--gold)">Modo edição.</strong> Preencha e clique em <strong>Salvar dados</strong>. Todas as propostas em PDF sairão com a sua identidade.' : 'Esses dados saem no cabeçalho e na assinatura de todas as suas propostas.') + '</p>' +
      body + '</section>' +
    '<div class="ac-stack ac-sticky"><section class="ac-card gold"><h3 class="ac-card-title">' + icon('eye') + 'Prévia do cabeçalho</h3>' +
      '<div class="ac-head-prev">' +
        (m.logo ? '<img src="' + esc(m.logo) + '" alt="">' : '') +
        '<div style="min-width:0"><div style="font-weight:700;font-size:1.05rem" data-out="mkNome"></div><div style="font-size:.8rem;color:#555" data-out="mkSub"></div></div></div>' +
      '<p class="ac-card-sub" style="margin:14px 0 0">A proposta é gerada em Orçamentos, pelo botão <strong>Baixar proposta em PDF</strong>.</p>' +
    '</section></div></div>';
  }

  // ---------------------------------------------------------------------------
  // Atualização dos valores calculados (sem re-render, preserva o foco)
  // ---------------------------------------------------------------------------
  function setOut(key, val, i) {
    var sel = '[data-out="' + key + '"]' + (i != null ? '[data-i="' + i + '"]' : '');
    S.root.querySelectorAll(sel).forEach(function (el) { el.textContent = val; });
  }

  function updateOutputs() {
    if (!S.root || !S.profile) return;
    var p = S.profile, h = calcHora(p);
    setOut('totalCustos', money(h.totalCustos));
    setOut('horasMes', fmtN(h.horasMes) + ' h');
    setOut('horasMesH', fmtN(h.horasMes) + ' h');
    setOut('custoHora', money(h.custoHora));
    setOut('precoHora', money(h.precoHora));

    if (S.tab === 'servicos') {
      (S.svDraft || p.servicos).forEach(function (s, i) {
        setOut('svVal', money(pos(s.horas) * h.precoHora), i);
        setOut('svRange', 'de ' + money(pos(s.min) * h.precoHora) + ' a ' + money(pos(s.max) * h.precoHora), i);
      });
    }
    if (S.tab === 'rapido') {
      p.rapido.forEach(function (r, i) { setOut('rpVal', money(pos(r.horas) * h.precoHora), i); });
      var hrs = sum(p.rapido, function (r) { return pos(r.horas); });
      setOut('rpHoras', fmtN(hrs) + ' h');
      setOut('rpTotal', money(hrs * h.precoHora));
    }
    if (S.tab === 'orcamento' && S.orcView === 'editor' && S.orc) {
      var o = S.orc, ph = precoDoOrc(o), c = calcOrc(o, ph);
      setOut('orcHora', money(ph));
      o.itens.forEach(function (it, i) { setOut('itVal', money(pos(it.horas) * ph), i); });
      setOut('oServ', money(c.subServ));
      setOut('oAdic', money(c.adic));
      setOut('oTotal', money(c.total));
      setOut('oBruto', money(c.bruto));
      setOut('oTaxa', fmtN(c.taxa * 100) + '%');
      setOut('oLiquido', money(c.liquido));
      setOut('oBrutoNec', c.meta > 0 ? money(c.brutoNec) : '–');
      setOut('oDesc', '− ' + money(c.descontoValor));
      setOut('oValidade', datas(o).validade.toLocaleDateString('pt-BR'));
      setOut('edTitle', o.cliente || 'Sem nome de cliente');
      (o.pagamentos || []).forEach(function (pg, i) {
        var el = S.root.querySelector('[data-out-html="pagRes"][data-i="' + i + '"]');
        if (el) el.innerHTML = c.bruto > 0 ? pagResHtml(pg, calcPag(pg, c.bruto), c, c.taxa) : '<span>Adicione serviços para ver os valores.</span>';
      });
      var v = S.root.querySelector('[data-out="verdict"]');
      if (v) v.innerHTML = verdictHtml(c, o);
      updateEditorStatus();
    }
    if (S.tab === 'marca') {
      var m = S.mkDraft || p.marca;
      setOut('mkNome', m.nome || 'Seu nome ou escritório');
      setOut('mkSub', [m.profissao, m.registro, m.cidade].filter(Boolean).join(' · ') || 'Profissão · Registro · Cidade');
    }
  }

  function updateEditorStatus() {
    if (!S.root || !S.orc) return;
    var o = S.orc;
    var st = S.root.querySelector('[data-out="orcStatus"]');
    var badge = S.root.querySelector('[data-out="edBadge"]');
    var draft = isRascunho(o);
    var lbl = S.root.querySelector('[data-out="edLabel"]');
    if (lbl) lbl.textContent = !draft ? 'Visualizando' : o.id ? 'Editando' : 'Novo orçamento';
    if (badge) badge.innerHTML = draft ? '<em class="ac-badge-draft">Rascunho</em>' : '<em class="ac-badge-final">Finalizado</em>';
    if (!st) return;
    if (!draft) { st.innerHTML = 'Finalizado em ' + fmtDate(o.finalizadoEm || new Date()) + ' · valores travados'; return; }
    if (!o.id && !orcHasContent(o)) { st.textContent = 'Informe o cliente ou um serviço para salvar.'; return; }
    if (S.oTimer || orcDirty(o)) { st.textContent = 'Salvando rascunho…'; return; }
    st.textContent = 'Rascunho salvo automaticamente' + (S.savedAt ? ' às ' + hhmm(S.savedAt) : '');
  }

  function verdictHtml(c, o) {
    var undo = S.undoAjuste && S.undoAjuste.orc === o ? '<button type="button" class="ac-link" data-act="undoAjuste">Desfazer ajuste</button>' : '';
    if (!c.valido) return '<div class="ac-verdict bad"><strong>Verifique os percentuais</strong>Taxas e impostos somando 100% ou mais tornam o cálculo impossível.</div>';
    if (c.total <= 0) return '<div class="ac-verdict neutral">Adicione serviços para ver o resultado.</div>';
    if (c.meta <= 0) return '<div class="ac-verdict neutral">Informe quanto você quer <strong class="ac-inline">receber líquido</strong> para saber se este preço atinge a sua meta.</div>';
    if (c.folga >= -0.005) {
      return '<div class="ac-verdict ok"><strong>Você está cobrando bem 💰</strong>O total está ' + money(c.folga) + ' acima do necessário para receber ' + money(c.meta) + ' líquidos. ' + undo + '</div>';
    }
    var podeAjustar = isRascunho(o) && c.subServ > 0;
    return '<div class="ac-verdict bad"><strong>Você está cobrando abaixo da sua meta</strong>Para receber ' + money(c.meta) + ' líquidos, faltam <strong class="ac-inline">' + money(-c.folga) + '</strong> no valor da proposta.' +
      (podeAjustar ? '<button type="button" class="ac-btn ac-btn-sm ac-btn-fix" data-act="ajustarMeta">' + icon('wand-2') + 'Ajustar o valor</button><span class="ac-fix-hint">Aumenta as horas dos serviços na proporção certa. Dá para desfazer.</span>'
        : '<span class="ac-fix-hint">Aumente as horas ou as despesas do caso.</span>') + '</div>';
  }

  // ---------------------------------------------------------------------------
  // Eventos
  // ---------------------------------------------------------------------------
  function setPath(path, value) {
    var parts = path.split('.');
    var obj = { p: S.profile, o: S.orc, mk: S.mkDraft, sv: S.svDraft }[parts[0]];
    if (!obj) return parts[0];
    for (var i = 1; i < parts.length - 1; i++) obj = obj[parts[i]];
    obj[parts[parts.length - 1]] = value;
    return parts[0];
  }

  function onInput(e) {
    var el = e.target;
    if (el.getAttribute && el.getAttribute('data-act-input') === 'busca') {
      S.busca = el.value; S.limite = { r: 10, f: 10 }; redrawRegion('saved'); return;
    }
    var bind = el.getAttribute && el.getAttribute('data-bind');
    if (!bind) return;
    if (bind.indexOf('o.') === 0 && S.orc && !isRascunho(S.orc)) return; // finalizado: travado
    var val = el.type === 'checkbox' ? el.checked :
      el.dataset.money ? parseMoney(el.value) :
      el.type === 'number' ? (el.value === '' ? '' : num(el.value)) : el.value;
    validateField(el);
    var scope = setPath(bind, val);
    if (scope === 'p') scheduleProfileSave();
    else if (scope === 'o') {
      if (bind === 'o.taxaPlataforma' || bind === 'o.impostos' || bind === 'o.validadeDias') {
        S.profile.padroesOrc[bind.slice(2)] = pos(val);
        scheduleProfileSave();
      }
      if (/^o\.itens\.\d+\.horas$/.test(bind)) S.undoAjuste = null;
      // Trocou a entrada entre % e R$: converte o valor para não virar "30 reais"
      var me = /^o\.pagamentos\.(\d+)\.entradaModo$/.exec(bind);
      if (me) {
        var pgE = S.orc.pagamentos[+me[1]];
        var baseE = calcOrc(S.orc, precoDoOrc(S.orc)).bruto;
        pgE.entrada = val === 'valor' ? Math.round(baseE * 0.3) : 30;
      }
      touchOrc();
    }
    updateOutputs();
  }

  function onFocusOut(e) {
    var el = e.target;
    if (el.dataset && el.dataset.money && el.value !== '') {
      var v = parseMoney(el.value);
      el.value = v ? moneyPlain(v) : '';
    }
  }

  function onChange(e) {
    var el = e.target;
    if (el.getAttribute('data-redraw')) {
      var b = el.getAttribute('data-bind');
      redrawTab();
      var again = b && S.root.querySelector('[data-bind="' + b + '"]'); // mantém o foco (teclado)
      if (again) again.focus();
      return;
    }
    var act = el.getAttribute('data-act-change');
    if (act === 'addItem' || act === 'addRapido') {
      var id = el.value;
      if (!id) return;
      var target = act === 'addItem' ? S.orc.itens : S.profile.rapido;
      if (id === '__avulso') target.push({ servicoId: null, nome: '', horas: 1 });
      else {
        var s = S.profile.servicos.filter(function (x) { return x.id === id; })[0];
        if (s) target.push({ servicoId: s.id, nome: s.nome, horas: num(s.horas) });
      }
      if (act === 'addItem') { S.undoAjuste = null; touchOrc(); } else scheduleProfileSave();
      redrawTab();
      var prefix = act === 'addItem' ? 'o.itens.' : 'p.rapido.';
      var inputs = S.root.querySelectorAll('[data-bind^="' + prefix + '"][data-bind$=".nome"]');
      if (id === '__avulso' && inputs.length) inputs[inputs.length - 1].focus();
    } else if (act === 'logo') {
      var f = el.files && el.files[0];
      if (f) loadLogo(f);
    }
  }

  function findRow(id) { return S.orcs.filter(function (x) { return x.id === id; })[0]; }

  function openOrcRow(r) {
    S.orc = clone(r.dados); S.orc.id = r.id;
    S.orcView = 'editor'; S.undoAjuste = null;
    migrarDescontoGeral(S.orc);
  }

  // O desconto geral saiu da calculadora. Rascunhos antigos que tinham desconto passam a tê-lo
  // na opção À vista (mesmo valor final à vista; parcelado parte do preço cheio).
  function migrarDescontoGeral(o) {
    var d = pos(o.desconto);
    if (!d || !isRascunho(o)) return false;
    o.pagamentos = o.pagamentos || [];
    var avistas = o.pagamentos.filter(function (pg) { return pg.tipo === 'avista'; });
    if (avistas.length) avistas.forEach(function (pg) { if (!pos(pg.desconto)) pg.desconto = d; });
    else { var nova = novaPag('avista'); nova.desconto = d; o.pagamentos.unshift(nova); }
    o.desconto = 0; delete o.descontoMotivo;
    touchOrc(o);
    toast('O desconto de ' + fmtN(d) + '% deste rascunho foi movido para o pagamento à vista.', 'info');
    return true;
  }

  function finalizar(o) {
    o.status = 'finalizado';
    o.precoHoraFixo = calcHora(S.profile).precoHora;
    o.finalizadoEm = new Date().toISOString();
    touchOrc(o);
    clearTimeout(S.oTimer); S.oTimer = null;
    return saveOrcNow(o);
  }

  function onClick(e) {
    var btn = e.target.closest('[data-act]');
    if (!btn || !S.root.contains(btn)) {
      S.root.querySelectorAll('.ac-help.open').forEach(function (h) { h.classList.remove('open'); });
      return;
    }
    var act = btn.getAttribute('data-act');
    var i = parseInt(btn.getAttribute('data-i'), 10);
    var list = btn.getAttribute('data-list');
    var id = btn.getAttribute('data-id');

    switch (act) {
      case 'help':
        e.preventDefault();
        var open = btn.classList.contains('open');
        S.root.querySelectorAll('.ac-help.open').forEach(function (h) { h.classList.remove('open'); });
        if (!open) { positionTip(btn); btn.classList.add('open'); }
        return;
      case 'tab':
        e.preventDefault();
        var novaAba = btn.getAttribute('data-tab');
        if (novaAba === S.tab && novaAba !== 'orcamento') return;
        if (!discardDrafts()) return;
        if (novaAba === 'orcamento') { flushOrc(); S.orcView = 'lista'; }
        S.tab = novaAba;
        draw();
        var t = S.root.querySelector('.ac-tab.active');
        if (t && btn.classList.contains('ac-tab')) t.focus();
        try { S.root.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (x) { /* noop */ }
        return;
      case 'tour':
        e.preventDefault();
        startTour();
        return;
      case 'hideChecklist':
        if (!confirm('Ocultar os primeiros passos? Eles não aparecerão de novo, mesmo com etapas pendentes.')) return;
        S.profile.flags.checklistOculto = true; scheduleProfileSave(); redrawRegion('checklist');
        return;
      case 'addPag':
        if (!S.orc.pagamentos) S.orc.pagamentos = [];
        if (S.orc.pagamentos.length >= MAX_PAGAMENTOS) return;
        S.orc.pagamentos.push(novaPag(btn.getAttribute('data-tipo')));
        touchOrc(); redrawTab();
        var pags = S.root.querySelectorAll('.ac-pag');
        if (pags.length) { pags[pags.length - 1].scrollIntoView({ block: 'nearest', behavior: 'smooth' }); var f1 = pags[pags.length - 1].querySelector('select'); if (f1) f1.focus(); }
        return;
      case 'pagPadrao':
        S.profile.padroesOrc.pagamentos = clone(S.orc.pagamentos || []);
        scheduleProfileSave();
        toast('Pronto. Os próximos orçamentos já começam com estas formas de pagamento.');
        return;
      case 'confirmSv':
        S.profile.flags.servicosConfirmados = true; scheduleProfileSave(); redrawTab();
        toast('Etapa concluída: serviços revisados.');
        return;
      case 'add':
        if (list === 'custos') S.profile.custos.push({ nome: '', valor: 0 });
        if (list === 'servicos') {
          if (!S.svDraft) S.svDraft = clone(S.profile.servicos);
          S.svDraft.push({ id: 'u' + Date.now(), categoria: 'Meus serviços', nome: '', horas: 1, min: 1, max: 2, obs: '' });
        }
        if (list === 'adicionais') S.orc.adicionais.push({ desc: '', valor: 0 });
        if (list === 'adicionais') touchOrc(); else if (list !== 'servicos') scheduleProfileSave();
        redrawTab();
        focusLast(list);
        return;
      case 'del':
        if (list === 'itens' || list === 'adicionais' || list === 'pagamentos') { S.orc[list].splice(i, 1); S.undoAjuste = null; touchOrc(); }
        else if (list === 'servicos') {
          if (!confirm('Remover o serviço "' + (S.svDraft[i].nome || 'sem nome') + '"? A remoção só vale depois de clicar em Salvar serviços.')) return;
          S.svDraft.splice(i, 1);
        } else { S.profile[list].splice(i, 1); scheduleProfileSave(); }
        redrawTab();
        return;
      case 'editSv':
        S.svDraft = clone(S.profile.servicos); redrawTab();
        return;
      case 'cancelSv':
        if (draftDirty('sv') && !confirm('Descartar as alterações nos serviços?')) return;
        S.svDraft = null; redrawTab();
        return;
      case 'saveSv':
        var validos = S.svDraft.filter(function (s) { return (s.nome || '').trim(); });
        var vazios = S.svDraft.length - validos.length;
        S.profile.servicos = validos; S.svDraft = null; S.profile.flags.servicosConfirmados = true;
        scheduleProfileSave();
        saveProfileNow().then(function (ok) {
          toast(ok ? 'Serviços salvos.' + (vazios ? ' ' + vazios + ' linha(s) sem nome foram descartadas.' : '') : 'Sem conexão. Os serviços serão salvos assim que a internet voltar.', ok ? 'success' : 'error');
        });
        redrawTab();
        return;
      case 'editMarca':
        S.mkDraft = clone(S.profile.marca); redrawTab();
        return;
      case 'cancelMarca':
        if (draftDirty('mk') && !confirm('Descartar as alterações nos seus dados?')) return;
        S.mkDraft = null; redrawTab();
        return;
      case 'saveMarca':
        salvarMarca(btn);
        return;
      case 'exemplo':
        S.profile.custos = EXEMPLO_CUSTOS.map(function (c) { return { nome: c[0], valor: c[1] }; });
        S.profile.horasSemana = 20; S.profile.semanasMes = 4.5; S.profile.margem = 50;
        scheduleProfileSave(); redrawTab();
        toast('Exemplo carregado. Agora troque pelos seus valores reais.', 'info');
        return;
      case 'restore':
        if (!confirm('Restaurar a lista padrão de serviços? Os serviços que você criou ou editou serão substituídos.')) return;
        S.profile.servicos = defaultServicos(); scheduleProfileSave(); redrawTab();
        toast('Lista padrão restaurada.');
        return;
      case 'mais':
        var k = btn.getAttribute('data-key'); S.limite[k] += 20; redrawRegion('saved');
        return;
      case 'newOrc':
        if (!discardDrafts()) return;
        flushOrc();
        S.orc = newOrc(); S.orcView = 'editor'; S.undoAjuste = null;
        if (S.tab !== 'orcamento') { S.tab = 'orcamento'; draw(); } else redrawTab();
        var nome = S.root.querySelector('[data-bind="o.cliente"]');
        if (nome) nome.focus();
        return;
      case 'backList':
        flushOrc();
        S.orcView = 'lista'; S.orc = null; redrawTab();
        return;
      case 'openOrc':
        flushOrc();
        var r = findRow(id);
        if (r) { openOrcRow(r); redrawTab(); try { S.root.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (x) { /* noop */ } }
        return;
      case 'pdfOrc':
        flushOrc();
        var rp = findRow(id);
        if (rp) { openOrcRow(rp); redrawTab(); abrirPreview(); }
        return;
      case 'dupOrc':
        flushOrc();
        var src = findRow(id) || (S.orc && S.orc.id === id ? { dados: S.orc } : null);
        if (!src && S.orc && !id) src = { dados: S.orc };
        if (src) {
          var copia = clone(src.dados);
          copia.id = null; copia.status = 'rascunho'; delete copia.precoHoraFixo; delete copia.finalizadoEm;
          copia.criadoEm = new Date().toISOString(); copia.dataEnvio = todayISO();
          copia.cliente = (copia.cliente || 'Orçamento') + ' (cópia)';
          S.orc = copia; S.orcView = 'editor'; S.undoAjuste = null;
          migrarDescontoGeral(copia);
          touchOrc(); redrawTab();
          toast('Cópia criada como rascunho, com os valores da sua hora atual.', 'info');
        }
        return;
      case 'reopenOrc':
        var antes = precoDoOrc(S.orc), agora = calcHora(S.profile).precoHora;
        var aviso = Math.abs(antes - agora) > 0.005 ? '\n\nOs valores serão recalculados com a sua hora atual (' + money(antes) + ' → ' + money(agora) + ').' : '';
        if (!confirm('Reabrir este orçamento como rascunho? Ele poderá ser editado de novo.' + aviso)) return;
        S.orc.status = 'rascunho'; delete S.orc.precoHoraFixo; delete S.orc.finalizadoEm;
        touchOrc(); redrawTab();
        toast('Orçamento reaberto como rascunho.', 'info');
        return;
      case 'delOrc':
        var row = findRow(id);
        if (!confirm('Excluir o orçamento de "' + ((row && row.cliente) || 'sem nome') + '"? Essa ação não pode ser desfeita.')) return;
        S.store.deleteOrc(id).then(function () {
          S.orcs = S.orcs.filter(function (x) { return x.id !== id; });
          if (S.orc && S.orc.id === id) { clearTimeout(S.oTimer); S.oTimer = null; S.orc = null; S.orcView = 'lista'; redrawTab(); }
          else redrawRegion('saved');
          redrawRegion('checklist');
          toast('Orçamento excluído.');
        }).catch(function (err) { console.error(err); toast('Não foi possível excluir. Verifique sua conexão e tente de novo.', 'error'); });
        return;
      case 'saveDraft':
      case 'saveFinal':
        if (!orcHasContent(S.orc)) { toast('Informe o cliente ou adicione um serviço antes de salvar.', 'error'); return; }
        if (act === 'saveFinal') {
          if (calcHora(S.profile).precoHora <= 0 && S.orc.itens.length) { toast('Sua hora está em R$ 0,00. Preencha Minha Hora antes de finalizar.', 'error'); return; }
          if (!confirm('Finalizar este orçamento? Os valores ficam travados para a proposta não mudar. Depois, para alterar, use Duplicar e editar.')) return;
          finalizar(S.orc).then(function (ok) {
            if (!ok) { toast('Sem conexão. O orçamento será salvo assim que a internet voltar.', 'error'); return; }
            redrawTab(); redrawRegion('checklist');
            toast('Orçamento finalizado. Ele está em "Finalizados".');
          });
          return;
        }
        touchOrc(); clearTimeout(S.oTimer); S.oTimer = null;
        saveOrcNow(S.orc).then(function (ok) {
          updateEditorStatus();
          toast(ok ? 'Rascunho salvo. Ele está em "Rascunhos".' : 'Sem conexão. O rascunho será salvo assim que a internet voltar.', ok ? 'success' : 'error');
        });
        return;
      case 'ajustarMeta':
        ajustarParaMeta();
        return;
      case 'undoAjuste':
        if (S.undoAjuste && S.undoAjuste.orc === S.orc) {
          S.orc.itens = S.undoAjuste.itens; S.undoAjuste = null; touchOrc(); redrawTab();
          toast('Ajuste desfeito.', 'info');
        }
        return;
      case 'rmLogo':
        if (S.mkDraft) S.mkDraft.logo = '';
        redrawTab();
        return;
      case 'verPdf':
        abrirPreview();
        return;
      case 'pdf':
        baixarDireto();
        return;
    }
  }

  // Aumenta as horas proporcionalmente até atingir a meta líquida
  function ajustarParaMeta() {
    var o = S.orc, ph = precoDoOrc(o), c = calcOrc(o, ph);
    if (!(c.folga < 0) || c.subServ <= 0) return;
    var anterior = clone(o.itens);
    var fator = (c.subServ - c.folga) / c.subServ;
    o.itens.forEach(function (it) { it.horas = Math.ceil(pos(it.horas) * fator * 100) / 100; });
    var guard = 0;
    while (calcOrc(o, ph).folga < -0.005 && guard++ < 50) { o.itens[0].horas = Math.round((pos(o.itens[0].horas) + 0.01) * 100) / 100; }
    S.undoAjuste = { orc: o, itens: anterior };
    touchOrc(); redrawTab();
    toast('Horas ajustadas em +' + fmtN((fator - 1) * 100) + '% para atingir sua meta.', 'info');
  }

  function onKey(e) {
    var t = e.target;
    if (e.key === 'Enter' && t.matches('[data-act="openOrc"]')) { t.click(); return; }
    if (t.classList && t.classList.contains('ac-tab') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End')) {
      e.preventDefault();
      var tabs = Array.prototype.slice.call(S.root.querySelectorAll('.ac-tab'));
      var idx = tabs.indexOf(t);
      var next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (idx + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].click();
    }
    if (e.key === 'Escape') {
      S.root.querySelectorAll('.ac-help.open').forEach(function (h) { h.classList.remove('open'); });
    }
  }

  // Tooltip sempre dentro da tela (desloca para a esquerda/direita e para baixo se precisar)
  function positionTip(btn) {
    var tip = btn.querySelector('.ac-tip');
    if (!tip) return;
    var r = btn.getBoundingClientRect();
    var vw = document.documentElement.clientWidth;
    var w = Math.min(270, vw - 24);
    var left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, vw - w - 12));
    tip.style.width = w + 'px';
    tip.style.left = (left - r.left) + 'px';
    tip.style.transform = 'none';
    var below = r.top < 170;
    tip.style.top = below ? 'calc(100% + 8px)' : 'auto';
    tip.style.bottom = below ? 'auto' : 'calc(100% + 8px)';
  }
  function onOver(e) {
    var h = e.target.closest && e.target.closest('.ac-help');
    if (h && S.root.contains(h)) positionTip(h);
  }

  function focusLast(list) {
    var prefix = list === 'adicionais' ? 'o.adicionais.' : list === 'servicos' ? 'sv.' : 'p.' + list + '.';
    var key = list === 'adicionais' ? '.desc' : '.nome';
    var els = S.root.querySelectorAll('[data-bind^="' + prefix + '"][data-bind$="' + key + '"]');
    if (els.length) els[els.length - 1].focus();
  }

  function bindEvents(root) {
    root.addEventListener('input', onInput);
    root.addEventListener('change', function (e) {
      if (e.target.type === 'checkbox' && e.target.getAttribute('data-bind')) { onInput(e); return; }
      if (e.target.type === 'date' && e.target.getAttribute('data-bind')) { onInput(e); return; }
      if (e.target.tagName === 'SELECT' && e.target.getAttribute('data-bind')) onInput(e); // garante em navegadores sem "input" no select
      onChange(e);
    });
    root.addEventListener('focusout', onFocusOut);
    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKey);
    root.addEventListener('mouseover', onOver);
    root.addEventListener('focusin', onOver);
    window.addEventListener('beforeunload', function (e) {
      if (!S.loaded) return;
      // Só salva o que realmente mudou (não sobrescreve dados de outro dispositivo)
      if (profileDirty()) saveProfileNow();
      if (S.oTimer) flushOrc();
      if (draftDirty('sv') || draftDirty('mk')) { e.preventDefault(); e.returnValue = ''; }
    });
  }

  // ---------------------------------------------------------------------------
  // Minha Marca: salvar (com upload do logo)
  // ---------------------------------------------------------------------------
  async function salvarMarca(btn) {
    var draft = S.mkDraft;
    if (btn) btn.disabled = true;
    try {
      if (draft.logo && draft.logo.indexOf('data:') === 0 && S.store.uploadLogo) {
        try { draft.logo = await S.store.uploadLogo(draft.logo); }
        catch (e) { console.warn('ActaCalc: upload do logo falhou, mantendo no perfil', e); }
      }
      if (!draft.logo && S.profile.marca.logo && S.store.removeLogo) S.store.removeLogo();
      S.profile.marca = draft; S.mkDraft = null;
      S.profile.flags.marcaSalva = true;
      scheduleProfileSave();
      var ok = await saveProfileNow();
      toast(ok ? 'Dados salvos. Eles já aparecem nas suas propostas.' : 'Sem conexão. Seus dados serão salvos assim que a internet voltar.', ok ? 'success' : 'error');
      redrawTab();
    } finally { if (btn) btn.disabled = false; }
  }

  function loadLogo(file) {
    if (file.size > 5 * 1024 * 1024) { toast('Imagem muito grande (máx. 5 MB).', 'error'); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var maxW = 480, maxH = 240;
        var ratio = Math.min(1, maxW / (img.width || maxW), maxH / (img.height || maxH));
        var w = Math.max(1, Math.round((img.width || maxW) * ratio)), h = Math.max(1, Math.round((img.height || maxH) * ratio));
        var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        if (S.mkDraft) S.mkDraft.logo = cv.toDataURL('image/png');
        redrawTab();
        toast('Logo carregado. Clique em Salvar dados para confirmar.', 'info');
      };
      img.onerror = function () { toast('Não foi possível ler esta imagem.', 'error'); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // ---------------------------------------------------------------------------
  // Proposta: pré-visualização e PDF
  // ---------------------------------------------------------------------------
  function propostaHtml(o) {
    var p = S.profile, m = p.marca;
    var ph = precoDoOrc(o), c = calcOrc(o, ph);
    var dt = datas(o), envio = dt.envio, validade = dt.validade;
    var digitos = String(o.documento || '').replace(/\D/g, '').length;
    var docLabel = digitos === 11 ? 'CPF' : digitos === 14 ? 'CNPJ' : 'CPF/CNPJ';
    var cliDet = [[docLabel, o.documento], ['E-mail', o.email], ['Telefone', o.telefone], ['Endereço', o.endereco], ['Imóvel / referência', o.descricao]]
      .filter(function (x) { return (x[1] || '').trim(); })
      .map(function (x) { return '<div' + (x[0] === 'Endereço' || x[0] === 'Imóvel / referência' ? ' class="full"' : '') + '><small>' + x[0] + '</small>' + esc(x[1]) + '</div>'; }).join('');
    var contato = [m.telefone, m.email, m.site].filter(Boolean).map(esc).join(' · ');
    var sub = [m.profissao, m.registro].filter(Boolean).map(esc).join(' · ');
    var linhas = o.itens.map(function (it) {
      return '<tr><td>' + esc(it.nome || 'Serviço') + '</td>' + (o.mostrarHoras ? '<td class="c">' + fmtN(pos(it.horas)) + ' h</td>' : '') +
        '<td class="r">' + money(pos(it.horas) * ph) + '</td></tr>';
    }).join('');
    var adics = o.adicionais.filter(function (a) { return pos(a.valor) > 0; }).map(function (a) {
      return '<tr><td>' + esc(a.desc || 'Despesa') + '</td>' + (o.mostrarHoras ? '<td></td>' : '') + '<td class="r">' + money(pos(a.valor)) + '</td></tr>';
    }).join('');
    var cols = o.mostrarHoras ? 3 : 2;
    // Condições de pagamento (com o total de cada opção e aviso de juros)
    var pags = (o.pagamentos || []).map(function (pg) { return { pg: pg, r: calcPag(pg, c.bruto) }; });
    var algumJuros = pags.some(function (x) { return x.r.comJuros; });
    // Total muda conforme a forma de pagamento? Então o resumo vira "Valor dos serviços"
    var totalVaria = pags.some(function (x) { return Math.abs(x.r.total - c.bruto) > 0.005; });
    var opAvista = null;
    pags.forEach(function (x, k) { if (x.pg.tipo === 'avista' && (!opAvista || x.r.total < opAvista.r.total)) opAvista = { r: x.r, k: k }; });
    var notaPag = algumJuros ?
      '<p class="pag-nota">' + (opAvista ? 'Preço à vista: ' + money(opAvista.r.total) + (pags.length > 1 ? ' (Opção ' + (opAvista.k + 1) + ')' : '') + '. ' : '') +
      'O total de cada opção parcelada já inclui o acréscimo do parcelamento.</p>' : '';
    var pagPdf = pags.length ? '<div class="pag"><h3>Condições de pagamento</h3>' +
      (pags.length > 1 ? '<p class="pag-intro">Escolha uma das opções abaixo:</p>' : '') +
      '<table class="pag-t"><tbody>' + pags.map(function (x, k) {
        return '<tr><td>' + (pags.length > 1 ? '<span class="op">Opção ' + (k + 1) + '</span>' : '') + esc(descPag(x.pg, x.r, true)) + '</td>' +
          '<td class="r"><small>Total</small>' + money(x.r.total) + '</td></tr>';
      }).join('') + '</tbody></table>' +
      notaPag + '</div>' : '';
    var titulo ='Proposta - ' + (o.cliente || 'Cliente') + ' - ' + envio.toLocaleDateString('pt-BR').replace(/\//g, '-');

    return { titulo: titulo, html: '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + esc(titulo) + '</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">' +
      '<style>' +
      '@page{size:A4;margin:16mm}*{box-sizing:border-box}html{background:#fff}body{font-family:Outfit,Arial,sans-serif;color:#1a1a1a;margin:0;font-size:12.5px;line-height:1.5;background:#fff}' +
      '.wrap{max-width:780px;margin:0 auto;padding:24px}' +
      'header{display:flex;align-items:center;gap:18px;padding-bottom:18px;border-bottom:3px solid #D4AF37}' +
      'header img{max-width:150px;max-height:80px;object-fit:contain}header h1{font-size:20px;margin:0}header .sub{color:#555;font-size:12px}' +
      '.title{display:flex;justify-content:space-between;align-items:flex-end;margin:26px 0 18px;gap:20px;flex-wrap:wrap}.title h2{font-size:24px;margin:0;letter-spacing:-.3px}' +
      '.meta{text-align:right;color:#555;font-size:12px}' +
      '.box{background:#faf7ec;border:1px solid #eee2b8;border-radius:8px;padding:14px 16px;margin-bottom:20px;break-inside:avoid}.box b{display:block;font-size:15px}' +
      '.box .lbl{color:#8a6d12;font-size:11px;text-transform:uppercase;letter-spacing:1px}' +
      '.cli{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px;margin-top:10px;padding-top:10px;border-top:1px solid #eee2b8}.cli .full{grid-column:1/-1}' +
      '.cli small{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#8a6d12}' +
      'table{width:100%;border-collapse:collapse;margin-bottom:6px}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}' +
      'th{text-align:left;font-size:10.5px;text-transform:uppercase;letter-spacing:1px;color:#8a6d12;border-bottom:2px solid #D4AF37;padding:8px 6px}' +
      'td{padding:9px 6px;border-bottom:1px solid #eee}.r{text-align:right;white-space:nowrap}.c{text-align:center;white-space:nowrap}' +
      '.grp td{background:#f6f6f6;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#666}' +
      '.tot{margin-left:auto;width:320px;max-width:100%;margin-top:10px;break-inside:avoid}.tot td{border:none;padding:5px 6px}.tot .big td{border-top:2px solid #1a1a1a;font-size:17px;font-weight:800;padding-top:10px}' +
      '.pag{margin-top:24px;break-inside:avoid}.pag-intro{margin:0 0 6px;color:#555}.pag-t td{vertical-align:middle}.pag-t small{display:block;font-size:9.5px;text-transform:uppercase;letter-spacing:.8px;color:#8a6d12}' +
      '.pag .op{display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#8a6d12;background:#faf7ec;border:1px solid #eee2b8;border-radius:4px;padding:1px 6px;margin-right:8px}' +
      '.pag-nota{font-size:11px;color:#666;margin:6px 0 0}' +
      '.tot .motivo{color:#777;font-size:10.5px}.tot .tot-nota{font-size:10.5px;color:#777;text-align:right;padding-top:2px}' +
      '.obs{margin-top:24px;white-space:pre-wrap;break-inside:avoid}.pag h3,.obs h3,.cond h3{font-size:13px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;color:#8a6d12}' +
      '.cond{margin-top:20px;color:#444;break-inside:avoid}.fim{break-inside:avoid;page-break-inside:avoid}.sign{margin-top:60px;display:flex;justify-content:space-between;gap:40px}.sign div{flex:1;border-top:1px solid #999;padding-top:6px;text-align:center;font-size:11.5px;color:#555}' +
      'footer{margin-top:40px;padding-top:12px;border-top:1px solid #eee;color:#777;font-size:11px;text-align:center}' +
      '.ios-hint{display:none}@media print{.wrap{padding:0}.ios-hint{display:none!important}}' +
      '</style></head><body><div class="wrap">' +
      ((m.logo || m.nome || sub || contato) ? '<header>' + (m.logo ? '<img src="' + esc(m.logo) + '" alt="">' : '') + '<div>' + (m.nome ? '<h1>' + esc(m.nome) + '</h1>' : '') +
        (sub ? '<div class="sub">' + sub + '</div>' : '') + (contato ? '<div class="sub">' + contato + '</div>' : '') + '</div></header>' : '') +
      '<div class="title"><h2>Proposta de Honorários</h2><div class="meta">' + (m.cidade ? esc(m.cidade) + ', ' : '') + envio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) +
        '<br>Válida até ' + validade.toLocaleDateString('pt-BR') + '</div></div>' +
      '<div class="box"><span class="lbl">Cliente</span><b>' + esc(o.cliente || '—') + '</b>' + (cliDet ? '<div class="cli">' + cliDet + '</div>' : '') + '</div>' +
      '<table><thead><tr><th>Descrição</th>' + (o.mostrarHoras ? '<th class="c">Horas</th>' : '') + '<th class="r">Valor</th></tr></thead><tbody>' +
        (linhas ? '<tr class="grp"><td colspan="' + cols + '">Serviços</td></tr>' + linhas : '') +
        (adics ? '<tr class="grp"><td colspan="' + cols + '">Despesas do caso</td></tr>' + adics : '') +
      '</tbody></table>' +
      '<table class="tot"><tbody>' +
        (c.descontoValor > 0.004 ? '<tr><td>Subtotal</td><td class="r">' + money(c.total) + '</td></tr><tr><td>Desconto (' + fmtN(pos(o.desconto)) + '%)</td><td class="r">− ' + money(c.descontoValor) + '</td></tr>' : '') +
        '<tr class="big"><td>' + (totalVaria ? 'Valor dos serviços' : 'Total') + '</td><td class="r">' + money(c.bruto) + '</td></tr>' +
        (totalVaria ? '<tr><td colspan="2" class="tot-nota">O valor final depende da forma de pagamento escolhida (veja abaixo).</td></tr>' : '') +
      '</tbody></table>' +
      pagPdf +
      (o.observacoes ? '<div class="obs"><h3>Observações</h3>' + esc(o.observacoes) + '</div>' : '') +
      '<div class="fim"><div class="cond"><h3>Validade</h3>Proposta enviada em ' + envio.toLocaleDateString('pt-BR') + ', válida por ' + fmtN(pos(o.validadeDias)) + ' dias (até ' + validade.toLocaleDateString('pt-BR') + ').</div>' +
      '<div class="sign"><div>' + esc(m.nome || 'Responsável') + (m.registro ? '<br>' + esc(m.registro) : '') + '</div><div>' + esc(o.cliente || 'Cliente') + '<br>De acordo</div></div></div>' +
      (contato ? '<footer>' + contato + '</footer>' : '') +
      '</div></body></html>' };
  }

  function podeGerar(o) {
    if (!o) return false;
    var ph = precoDoOrc(o), c = calcOrc(o, ph);
    if (!o.itens.length && c.adic <= 0) { toast('Adicione ao menos um serviço antes de gerar a proposta.', 'error'); return false; }
    if (ph <= 0 && o.itens.length) { toast('Sua hora está em R$ 0,00. Preencha Minha Hora para a proposta ter valores.', 'error'); return false; }
    return true;
  }

  // Baixar sem abrir a pré-visualização (rascunho pede confirmação, pois será finalizado)
  function baixarDireto() {
    var o = S.orc;
    if (!podeGerar(o)) return;
    if (isRascunho(o) && !confirm('Baixar a proposta finaliza este orçamento e trava os valores. Para conferir antes, use "Visualizar proposta".\n\nBaixar agora?')) return;
    var doc = propostaHtml(o);
    if (isIOS()) { baixarPdf(o, null, doc); return; }
    var old = document.getElementById('ac-print-frame');
    if (old) old.remove();
    var f = document.createElement('iframe');
    f.id = 'ac-print-frame';
    f.setAttribute('aria-hidden', 'true');
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    var pronto = false;
    f.onload = function () {
      if (pronto) return; pronto = true;
      var d = f.contentDocument;
      var imgs = Array.prototype.slice.call(d.images);
      Promise.all([d.fonts ? d.fonts.ready : 0].concat(imgs.map(function (im) { return im.complete ? 0 : new Promise(function (r) { im.onload = im.onerror = r; }); })))
        .then(function () { setTimeout(function () { baixarPdf(o, f, doc); }, 150); });
    };
    document.body.appendChild(f);
    f.srcdoc = doc.html;
  }

  function abrirPreview() {
    var o = S.orc;
    if (!podeGerar(o)) return;
    var doc = propostaHtml(o);
    fecharPreview();
    var ov = document.createElement('div');
    ov.className = 'ac-modal';
    ov.id = 'ac-preview';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Pré-visualização da proposta');
    var draft = isRascunho(o);
    ov.innerHTML = '<div class="ac-modal-box"><div class="ac-modal-head"><strong>Pré-visualização da proposta</strong>' +
      '<button type="button" class="ac-icon-btn" data-modal="close" aria-label="Fechar">' + icon('x') + '</button></div>' +
      '<iframe class="ac-modal-frame" title="Proposta"></iframe>' +
      '<div class="ac-modal-foot"><span class="ac-modal-note">' +
        (draft ? icon('lock') + ' Ao baixar, o orçamento é finalizado e os valores ficam travados.' : '') +
        (!(S.profile.marca.nome || '').trim() ? (draft ? '<br>' : '') + 'Dica: cadastre seus dados em Minha Marca para a proposta sair com a sua identidade.' : '') + '</span>' +
      '<button type="button" class="ac-btn ac-btn-ghost" data-modal="close">Fechar</button>' +
      '<button type="button" class="ac-btn ac-btn-primary" data-modal="print">' + icon('file-down') + 'Baixar PDF</button></div></div>';
    document.body.appendChild(ov);
    var frame = ov.querySelector('iframe');
    frame.srcdoc = doc.html;
    refreshIcons();
    var prevFocus = document.activeElement;
    ov.addEventListener('click', function (e) {
      var b = e.target.closest('[data-modal]');
      if (e.target === ov || (b && b.getAttribute('data-modal') === 'close')) { fecharPreview(); if (prevFocus && prevFocus.focus) prevFocus.focus(); return; }
      if (b && b.getAttribute('data-modal') === 'print') baixarPdf(o, frame, doc);
    });
    ov.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fecharPreview(); if (prevFocus && prevFocus.focus) prevFocus.focus(); } });
    var primary = ov.querySelector('[data-modal="print"]');
    if (primary) primary.focus();
  }

  function fecharPreview() {
    var old = document.getElementById('ac-preview');
    if (old) old.remove();
  }

  function baixarPdf(o, frame, doc) {
    var eraRascunho = isRascunho(o);
    if (eraRascunho) {
      finalizar(o).then(function () { if (S.tab === 'orcamento') redrawTab(); redrawRegion('checklist'); });
    } else flushOrc();
    if (isIOS()) {
      // No iPhone/iPad a impressão de iframe falha: abre a proposta numa nova aba
      var html = doc.html.replace('</body>', '<div class="ios-hint" style="display:block;position:fixed;left:0;right:0;bottom:0;background:#111;color:#fff;padding:12px 16px;font:14px Outfit,Arial,sans-serif;text-align:center">Para salvar em PDF: toque em Compartilhar › Imprimir, ou Salvar em Arquivos.</div><script>setTimeout(function(){window.print()},600)<\/script></body>');
      var url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      var w = window.open(url, '_blank');
      if (!w) toast('Permita pop-ups para baixar a proposta.', 'error');
    } else {
      var oldTitle = document.title;
      document.title = doc.titulo; // vira o nome sugerido do arquivo PDF
      try { frame.contentWindow.focus(); frame.contentWindow.print(); }
      catch (e) { toast('Não foi possível abrir a impressão.', 'error'); }
      setTimeout(function () { document.title = oldTitle; }, 1500);
    }
    if (eraRascunho) toast('Orçamento finalizado. Os valores ficaram travados para a proposta não mudar.', 'info');
  }

  // ---------------------------------------------------------------------------
  // API pública
  // ---------------------------------------------------------------------------
  window.ActaCalc = {
    render: render,
    reset: reset,
    // expostos para testes
    _calcHora: calcHora,
    _calcOrc: calcOrc,
    _parseMoney: parseMoney,
    _calcPag: calcPag,
    _descPag: descPag,
    _defaultProfile: defaultProfile
  };
})();
