/**
 * Faturamento no Copo - Lógica do Mini App
 * Especial para Confeiteiras Iniciantes
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // ELEMENTOS DO DOM: NAVEGAÇÃO
  // ==========================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const bottomNavButtons = document.querySelectorAll('.bottom-nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const checklistCounterBadge = document.getElementById('checklistCounterBadge');
  const bottomNavBadge = document.getElementById('bottomNavBadge');

  // ==========================================
  // ELEMENTOS DO DOM: CALCULADORA
  // ==========================================
  const costMorangos = document.getElementById('costMorangos');
  const costLeiteCond = document.getElementById('costLeiteCond');
  const costChocolate = document.getElementById('costChocolate');
  const costEmbalagens = document.getElementById('costEmbalagens');
  const costOutros = document.getElementById('costOutros');
  const rendimentoCopos = document.getElementById('rendimentoCopos');
  const btnMinusYield = document.getElementById('btnMinusYield');
  const btnPlusYield = document.getElementById('btnPlusYield');
  
  const marginSlider = document.getElementById('marginSlider');
  const marginDisplay = document.getElementById('marginDisplay');
  const marginChips = document.querySelectorAll('.margin-chip');

  const btnClearCalc = document.getElementById('btnClearCalc');
  const btnCopyReport = document.getElementById('btnCopyReport');
  const btnQuickDemo = document.getElementById('btnQuickDemo');

  // Elementos de Exibição dos Resultados
  const valCustoUnitario = document.getElementById('valCustoUnitario');
  const valPrecoSugerido = document.getElementById('valPrecoSugerido');
  const valLucroUnitarioTxt = document.getElementById('valLucroUnitarioTxt');
  const txtBatchCups = document.getElementById('txtBatchCups');
  const valCustoTotal = document.getElementById('valCustoTotal');
  const valFaturamentoTotal = document.getElementById('valFaturamentoTotal');
  const valLucroTotal = document.getElementById('valLucroTotal');
  const txtProfitRatio = document.getElementById('txtProfitRatio');
  const barCost = document.getElementById('barCost');
  const barProfit = document.getElementById('barProfit');

  // ==========================================
  // ELEMENTOS DO DOM: CHECKLIST
  // ==========================================
  const checklistItemsList = document.getElementById('checklistItemsList');
  const emptyChecklistState = document.getElementById('emptyChecklistState');
  const progressSummary = document.getElementById('progressSummary');
  const progressPercentage = document.getElementById('progressPercentage');
  const progressFill = document.getElementById('progressFill');
  const btnCheckAll = document.getElementById('btnCheckAll');
  const btnUncheckAll = document.getElementById('btnUncheckAll');
  const btnResetDefault = document.getElementById('btnResetDefault');
  const addItemForm = document.getElementById('addItemForm');
  const newItemName = document.getElementById('newItemName');
  const newItemCategory = document.getElementById('newItemCategory');

  // Toast
  const toastNotification = document.getElementById('toastNotification');

  // Estado Atual
  let currentMargin = 100;

  // Itens Padrão do Checklist solicitados
  const DEFAULT_ITEMS = [
    { id: '1', name: 'Leite condensado (caixa/lata)', category: '🥛 Laticínios', checked: false },
    { id: '2', name: 'Creme de leite (caixinha)', category: '🥛 Laticínios', checked: false },
    { id: '3', name: 'Morango fresco selecionado', category: '🍓 Frutas', checked: false },
    { id: '4', name: 'Uva verde sem semente', category: '🍓 Frutas', checked: false },
    { id: '5', name: 'Copo bolha com tampa (250ml/350ml)', category: '🥤 Embalagens', checked: false },
    { id: '6', name: 'Colheres descartáveis reforçadas', category: '🥤 Embalagens', checked: false }
  ];

  let checklistItems = [];

  // ==========================================
  // INICIALIZAÇÃO
  // ==========================================
  initChecklist();
  initCalculator();
  initNavigation();

  // ==========================================
  // NAVEGAÇÃO DE ABAS
  // ==========================================
  function switchTab(targetTabId) {
    // Top Tabs
    tabButtons.forEach(btn => {
      if (btn.dataset.tab === targetTabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Bottom Tabs
    bottomNavButtons.forEach(btn => {
      if (btn.dataset.tab === targetTabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Conteúdo das Abas
    tabContents.forEach(content => {
      if (content.id === targetTabId) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initNavigation() {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    bottomNavButtons.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
  }

  // ==========================================
  // LÓGICA DA CALCULADORA DE CUSTOS
  // ==========================================
  function formatCurrency(val) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function parseInputValue(inputEl) {
    const raw = parseFloat(inputEl.value);
    return isNaN(raw) || raw < 0 ? 0 : raw;
  }

  function calculateCosts() {
    const morangos = parseInputValue(costMorangos);
    const leiteCond = parseInputValue(costLeiteCond);
    const chocolate = parseInputValue(costChocolate);
    const embalagens = parseInputValue(costEmbalagens);
    const outros = parseInputValue(costOutros);

    let rendimento = parseInt(rendimentoCopos.value, 10);
    if (isNaN(rendimento) || rendimento <= 0) {
      rendimento = 1;
    }

    const totalCost = morangos + leiteCond + chocolate + embalagens + outros;
    const unitCost = totalCost / rendimento;

    // Preço Sugerido com Margem de Lucro:
    // Sugestão de venda = Custo Unitário * (1 + margem%)
    const suggestedPrice = unitCost * (1 + currentMargin / 100);
    const unitProfit = suggestedPrice - unitCost;

    const totalRevenue = suggestedPrice * rendimento;
    const totalProfit = totalRevenue - totalCost;

    // Atualiza DOM
    valCustoUnitario.textContent = formatCurrency(unitCost);
    valPrecoSugerido.textContent = formatCurrency(suggestedPrice);
    valLucroUnitarioTxt.innerHTML = `Lucro líquido: <strong>${formatCurrency(unitProfit)}</strong> / copo`;

    txtBatchCups.textContent = `${rendimento} copo${rendimento > 1 ? 's' : ''}`;
    valCustoTotal.textContent = formatCurrency(totalCost);
    valFaturamentoTotal.textContent = formatCurrency(totalRevenue);
    valLucroTotal.textContent = formatCurrency(totalProfit);

    // Barra de proporção (Custo vs Lucro no Preço Final)
    if (suggestedPrice > 0) {
      const costPercent = Math.round((unitCost / suggestedPrice) * 100);
      const profitPercent = 100 - costPercent;
      barCost.style.width = `${costPercent}%`;
      barProfit.style.width = `${profitPercent}%`;
      txtProfitRatio.textContent = `Custo ${costPercent}% | Lucro ${profitPercent}%`;
    } else {
      barCost.style.width = `50%`;
      barProfit.style.width = `50%`;
      txtProfitRatio.textContent = `Custo 50% | Lucro 50%`;
    }

    // Salva no localStorage para a confeiteira não perder
    saveCalcState();
  }

  function setMargin(val) {
    currentMargin = parseInt(val, 10);
    marginSlider.value = currentMargin;
    marginDisplay.textContent = `${currentMargin}%`;

    // Sincroniza chips
    marginChips.forEach(chip => {
      if (parseInt(chip.dataset.margin, 10) === currentMargin) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    calculateCosts();
  }

  function initCalculator() {
    // Eventos de digitação nos inputs
    [costMorangos, costLeiteCond, costChocolate, costEmbalagens, costOutros, rendimentoCopos].forEach(input => {
      input.addEventListener('input', calculateCosts);
    });

    // Botões de incremento/decremento do rendimento
    btnMinusYield.addEventListener('click', () => {
      let current = parseInt(rendimentoCopos.value, 10) || 1;
      if (current > 1) {
        rendimentoCopos.value = current - 1;
        calculateCosts();
      }
    });

    btnPlusYield.addEventListener('click', () => {
      let current = parseInt(rendimentoCopos.value, 10) || 1;
      rendimentoCopos.value = current + 1;
      calculateCosts();
    });

    // Slider de margem
    marginSlider.addEventListener('input', (e) => {
      setMargin(e.target.value);
    });

    // Chips de margem
    marginChips.forEach(chip => {
      chip.addEventListener('click', () => {
        setMargin(chip.dataset.margin);
      });
    });

    // Limpar campos
    btnClearCalc.addEventListener('click', () => {
      costMorangos.value = '';
      costLeiteCond.value = '';
      costChocolate.value = '';
      costEmbalagens.value = '';
      costOutros.value = '';
      rendimentoCopos.value = '10';
      setMargin(100);
      calculateCosts();
      showToast('Campos da calculadora limpos ✨');
    });

    // Botão Exemplo Pronto (Copo da Felicidade de Morango c/ Chocolate)
    btnQuickDemo.addEventListener('click', () => {
      loadDemoData();
    });

    // Copiar Resumo para WhatsApp
    btnCopyReport.addEventListener('click', copySummaryToClipboard);

    // Carregar estado prévio ou exemplo inicial
    loadCalcState();
  }

  function loadDemoData() {
    costMorangos.value = '16.00';
    costLeiteCond.value = '14.50';
    costChocolate.value = '18.00';
    costEmbalagens.value = '12.00';
    costOutros.value = '6.50';
    rendimentoCopos.value = '8';
    setMargin(130);
    calculateCosts();
    showToast('Receita exemplo carregada com sucesso! 🍓🍫');
  }

  function saveCalcState() {
    const state = {
      morangos: costMorangos.value,
      leiteCond: costLeiteCond.value,
      chocolate: costChocolate.value,
      embalagens: costEmbalagens.value,
      outros: costOutros.value,
      rendimento: rendimentoCopos.value,
      margin: currentMargin
    };
    try {
      localStorage.setItem('faturamento_calc_state', JSON.stringify(state));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage', e);
    }
  }

  function loadCalcState() {
    try {
      const saved = localStorage.getItem('faturamento_calc_state');
      if (saved) {
        const state = JSON.parse(saved);
        if (state.morangos !== undefined) costMorangos.value = state.morangos;
        if (state.leiteCond !== undefined) costLeiteCond.value = state.leiteCond;
        if (state.chocolate !== undefined) costChocolate.value = state.chocolate;
        if (state.embalagens !== undefined) costEmbalagens.value = state.embalagens;
        if (state.outros !== undefined) costOutros.value = state.outros;
        if (state.rendimento !== undefined) rendimentoCopos.value = state.rendimento;
        if (state.margin !== undefined) setMargin(state.margin);
      } else {
        // Se for a primeira vez abrindo, carregar o exemplo amigável
        loadDemoData();
        return;
      }
    } catch (e) {
      console.warn('Erro ao ler do localStorage', e);
    }
    calculateCosts();
  }

  function copySummaryToClipboard() {
    const rend = rendimentoCopos.value || '1';
    const cUnit = valCustoUnitario.textContent;
    const pSug = valPrecoSugerido.textContent;
    const cTot = valCustoTotal.textContent;
    const fTot = valFaturamentoTotal.textContent;
    const lTot = valLucroTotal.textContent;

    const summaryText = 
`🍓 *RESUMO DE PRECIFICAÇÃO - FATURAMENTO NO COPO* 🍓
━━━━━━━━━━━━━━━━━━━━
🧁 *Rendimento:* ${rend} copos
💰 *Custo Total da Receita:* ${cTot}
📉 *Custo por Copo:* ${cUnit}
📈 *Margem de Lucro:* ${currentMargin}%
━━━━━━━━━━━━━━━━━━━━
✨ *PREÇO SUGERIDO DE VENDA:* ${pSug} / copo
💵 *Faturamento Estimado:* ${fTot}
💖 *Seu Lucro Líquido:* ${lTot}
━━━━━━━━━━━━━━━━━━━━
Feito com amor pelo app Faturamento no Copo ♡`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summaryText).then(() => {
        showToast('📋 Resumo copiado para a área de transferência!');
      }).catch(() => {
        fallbackCopyText(summaryText);
      });
    } else {
      fallbackCopyText(summaryText);
    }
  }

  function fallbackCopyText(text) {
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    try {
      document.execCommand('copy');
      showToast('📋 Resumo copiado para a área de transferência!');
    } catch (err) {
      alert('Não foi possível copiar automaticamente. Selecione e copie o texto abaixo:\n\n' + text);
    }
    document.body.removeChild(tempTextArea);
  }

  // ==========================================
  // LÓGICA DO CHECKLIST DE COMPRAS
  // ==========================================
  function initChecklist() {
    loadChecklist();

    // Adicionar item pelo form
    addItemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = newItemName.value.trim();
      const cat = newItemCategory.value;
      if (!name) return;

      const newItem = {
        id: Date.now().toString(),
        name: name,
        category: cat,
        checked: false
      };

      checklistItems.push(newItem);
      saveChecklist();
      renderChecklist();
      newItemName.value = '';
      showToast(`Adicionado: ${name} ✅`);
    });

    // Marcar todos
    btnCheckAll.addEventListener('click', () => {
      if (checklistItems.length === 0) return;
      checklistItems.forEach(item => item.checked = true);
      saveChecklist();
      renderChecklist();
      showToast('Todos os itens foram marcados! 🎉');
    });

    // Desmarcar todos
    btnUncheckAll.addEventListener('click', () => {
      if (checklistItems.length === 0) return;
      checklistItems.forEach(item => item.checked = false);
      saveChecklist();
      renderChecklist();
      showToast('Todos os itens desmarcados ↺');
    });

    // Restaurar padrão
    btnResetDefault.addEventListener('click', () => {
      if (confirm('Deseja restaurar a lista com os ingredientes padrão do Copo da Felicidade?')) {
        checklistItems = JSON.parse(JSON.stringify(DEFAULT_ITEMS));
        saveChecklist();
        renderChecklist();
        showToast('Lista padrão restaurada 🧁');
      }
    });

    renderChecklist();
  }

  function toggleCheckItem(id) {
    const item = checklistItems.find(it => it.id === id);
    if (item) {
      item.checked = !item.checked;
      saveChecklist();
      renderChecklist();
    }
  }

  function removeItem(id) {
    checklistItems = checklistItems.filter(it => it.id !== id);
    saveChecklist();
    renderChecklist();
    showToast('Item removido da lista');
  }

  function renderChecklist() {
    checklistItemsList.innerHTML = '';

    if (checklistItems.length === 0) {
      emptyChecklistState.style.display = 'block';
    } else {
      emptyChecklistState.style.display = 'none';
    }

    let checkedCount = 0;

    checklistItems.forEach(item => {
      if (item.checked) checkedCount++;

      const li = document.createElement('li');
      li.className = `chk-item ${item.checked ? 'checked' : ''}`;
      li.setAttribute('data-id', item.id);

      li.innerHTML = `
        <div class="chk-item-main">
          <div class="chk-box">
            <svg viewBox="0 0 24 24" fill="none">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="chk-text-content">
            <span class="chk-name">${escapeHtml(item.name)}</span>
            <span class="chk-cat-badge">${escapeHtml(item.category)}</span>
          </div>
        </div>
        <button type="button" class="btn-remove-item" title="Excluir item">
          &times;
        </button>
      `;

      // Evento de clique para marcar/desmarcar
      li.querySelector('.chk-item-main').addEventListener('click', () => {
        toggleCheckItem(item.id);
      });

      // Evento para remover
      li.querySelector('.btn-remove-item').addEventListener('click', (e) => {
        e.stopPropagation();
        removeItem(item.id);
      });

      checklistItemsList.appendChild(li);
    });

    // Atualiza contadores e barra de progresso
    const totalCount = checklistItems.length;
    const percent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

    progressSummary.textContent = `${checkedCount} de ${totalCount} itens no carrinho`;
    progressPercentage.textContent = `${percent}%`;
    progressFill.style.width = `${percent}%`;

    const badgeText = `${checkedCount}/${totalCount}`;
    checklistCounterBadge.textContent = badgeText;
    bottomNavBadge.textContent = badgeText;

    // Efeito especial quando 100% concluído
    if (totalCount > 0 && checkedCount === totalCount) {
      progressFill.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
    } else {
      progressFill.style.background = 'linear-gradient(90deg, var(--rose-accent) 0%, var(--choco-primary) 100%)';
    }
  }

  function saveChecklist() {
    try {
      localStorage.setItem('faturamento_checklist_items', JSON.stringify(checklistItems));
    } catch (e) {
      console.warn('Erro ao salvar checklist', e);
    }
  }

  function loadChecklist() {
    try {
      const saved = localStorage.getItem('faturamento_checklist_items');
      if (saved) {
        checklistItems = JSON.parse(saved);
      } else {
        checklistItems = JSON.parse(JSON.stringify(DEFAULT_ITEMS));
      }
    } catch (e) {
      checklistItems = JSON.parse(JSON.stringify(DEFAULT_ITEMS));
    }
  }

  // ==========================================
  // UTILITÁRIOS
  // ==========================================
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  let toastTimeout;
  function showToast(message) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastNotification.textContent = message;
    toastNotification.classList.add('show');
    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2800);
  }

});
