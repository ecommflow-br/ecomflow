/**
 * ProfitAI 2026 - Calculation Logic & UI Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    const ProfitAI = {
        state: {
            currentPlatform: 'shopee',
            taxData: {
                shopee: { commission: 14, fixedFee: 7, maxCommission: 105, transactionFee: 2 },
                mercadolivre: { commission: 14, fixedFee: 6.5, maxCommission: 0, transactionFee: 2 },
                amazon: { commission: 20, fixedFee: 0, maxCommission: 0, transactionFee: 2 },
                magalu: { commission: 14, fixedFee: 0, maxCommission: 0, transactionFee: 2 }
            },
            theme: localStorage.getItem('theme') || 'dark'
        },

        init() {
            this.setTheme(this.state.theme);
            this.setupListeners();
            this.showInitialAlert();
        },

        setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            const icon = document.getElementById('themeIcon');
            const text = document.getElementById('themeText');
            if (icon) icon.textContent = theme === 'light' ? '☀️' : '🌙';
            if (text) text.textContent = theme === 'light' ? 'Light' : 'Dark';
        },

        toggleTheme() {
            const nextTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            this.setTheme(nextTheme);
            this.notify(`Tema ${nextTheme} ativado`, 'success');
        },

        setupListeners() {
            // Theme Toggle
            document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

            // Platform Selection
            document.querySelectorAll('.platform-card-2026').forEach(card => {
                card.addEventListener('click', (e) => {
                    document.querySelectorAll('.platform-card-2026').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    this.state.currentPlatform = card.dataset.platform;

                    // Clear manual tax if a platform is selected
                    document.getElementById('manualTax').value = '';

                    this.notify(`Plataforma selecionada: ${card.querySelector('.platform-name').textContent}`, 'success');
                });
            });

            // Manual Tax Input
            const manualTax = document.getElementById('manualTax');
            manualTax.addEventListener('input', () => {
                if (manualTax.value !== '') {
                    document.querySelectorAll('.platform-card-2026').forEach(c => c.classList.remove('active'));
                    this.state.currentPlatform = 'manual';
                }
            });

            // Margin Slider
            const slider = document.getElementById('profitMargin');
            const sliderVal = document.getElementById('marginValue');
            slider.addEventListener('input', () => {
                sliderVal.textContent = `${slider.value}%`;
            });

            // Form Submit
            document.getElementById('smartForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculate();
            });
        },

        calculate() {
            const cost = parseFloat(document.getElementById('productCost').value) || 0;
            const desiredMargin = parseFloat(document.getElementById('profitMargin').value) / 100;
            const shipping = parseFloat(document.getElementById('shippingCost').value) || 0;
            const other = parseFloat(document.getElementById('otherCosts').value) || 0;
            const sellerType = document.getElementById('sellerType').value;
            const isFreeShipping = document.getElementById('freeShipping').checked;
            const manualTaxVal = parseFloat(document.getElementById('manualTax').value);

            let commissionRate = 0;
            let fixedFee = 0;
            let platformName = '';
            let maxCommission = 0;
            let transactionRate = 0.02; // Default 2%

            if (this.state.currentPlatform === 'manual' && !isNaN(manualTaxVal)) {
                commissionRate = manualTaxVal / 100;
                platformName = 'Personalizado';
            } else {
                const platform = this.state.taxData[this.state.currentPlatform];
                commissionRate = platform.commission / 100;
                fixedFee = platform.fixedFee;
                maxCommission = platform.maxCommission;
                transactionRate = platform.transactionFee / 100;
                platformName = this.state.currentPlatform;

                if (isFreeShipping && this.state.currentPlatform === 'shopee') commissionRate += 0.06;
                if (this.state.currentPlatform === 'shopee') {
                    fixedFee = sellerType === 'cnpj' ? 4 : 7;
                }
            }

            const totalFixedCosts = cost + shipping + other + fixedFee;

            // Price = (Fixed Costs + Profit) / (1 - Variable Rates)
            const desiredProfit = cost * desiredMargin;
            let recommendedPrice = (totalFixedCosts + desiredProfit) / (1 - commissionRate - transactionRate);

            // Cap Shopee Commission
            if (this.state.currentPlatform === 'shopee' && maxCommission > 0) {
                const comm = recommendedPrice * commissionRate;
                if (comm > maxCommission) {
                    recommendedPrice = (totalFixedCosts + desiredProfit + maxCommission) / (1 - transactionRate);
                }
            }

            this.updateUI(recommendedPrice, cost, commissionRate, fixedFee, transactionRate);
            this.generateTable(cost, shipping, other, fixedFee, commissionRate, transactionRate);
        },

        updateUI(price, cost, commRate, fixedFee, transRate) {
            const commAmount = (price * commRate) + (price * transRate);
            const netProfit = price - cost - commAmount - fixedFee;
            const realMargin = (netProfit / price) * 100;

            document.getElementById('results').style.display = 'block';
            document.getElementById('recommendedPrice').textContent = this.formatCurrency(price);
            document.getElementById('estimatedProfit').textContent = this.formatCurrency(netProfit);
            document.getElementById('marginStatus').textContent = `Margem Real: ${realMargin.toFixed(1)}%`;

            document.getElementById('detailProductCost').textContent = this.formatCurrency(cost);
            document.getElementById('detailPlatformFee').textContent = this.formatCurrency(commAmount);
            document.getElementById('detailFixedFee').textContent = this.formatCurrency(fixedFee);

            const status = document.getElementById('profitStatus');
            if (realMargin > 40) {
                status.className = 'profit-indicator profit-good';
                status.innerHTML = '<i class="fas fa-rocket"></i> Lucro Altíssimo';
            } else if (realMargin > 20) {
                status.className = 'profit-indicator profit-good';
                status.innerHTML = '<i class="fas fa-check-circle"></i> Lucro Saudável';
            } else {
                status.className = 'profit-indicator profit-warning';
                status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Margem Aperatada';
            }

            document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
        },

        generateTable(cost, shipping, other, fixedFee, commRate, transRate) {
            const margins = [10, 20, 30, 40, 50, 75, 100, 150];
            const tbody = document.getElementById('pricingTableBody');
            tbody.innerHTML = '';

            margins.forEach(m => {
                const mPerc = m / 100;
                let price = (cost + shipping + other + fixedFee + (cost * mPerc)) / (1 - commRate - transRate);
                const net = price - cost - (price * commRate) - (price * transRate) - fixedFee;
                const roi = (net / cost) * 100;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${m}%</td>
                    <td>${this.formatCurrency(price)}</td>
                    <td>${this.formatCurrency(net)}</td>
                    <td>${roi.toFixed(0)}%</td>
                    <td class="status-cell"><span class="${m >= 40 ? 'profit-good' : 'profit-warning'}">${m >= 40 ? 'Ideal' : 'Baixo'}</span></td>
                `;
                tbody.appendChild(tr);
            });

            document.getElementById('pricingTableContainer').style.display = 'block';
        },

        formatCurrency(v) {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
        },

        notify(msg, type) {
            const el = document.getElementById('systemAlert');
            el.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
            el.classList.add('show');
            setTimeout(() => el.classList.remove('show'), 3000);
        },

        showInitialAlert() {
            setTimeout(() => {
                document.getElementById('systemAlert').classList.add('show');
                setTimeout(() => document.getElementById('systemAlert').classList.remove('show'), 5000);
            }, 500);
        }
    };

    ProfitAI.init();
});

function saveCalculation() {
    alert('Análise salva com sucesso (Simulado)');
}

function exportResults() {
    alert('Resultados exportados (Simulado)');
}
