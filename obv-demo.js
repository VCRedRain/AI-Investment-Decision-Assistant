// OBV demo chart using mock OHLCV data for selected symbols
(() => {
    const MOCK_OBV_DATA = {
        '2330': {
            dates: ['2026-04-01','2026-04-02','2026-04-03','2026-04-04','2026-04-05','2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10','2026-04-11','2026-04-12','2026-04-13','2026-04-14','2026-04-15'],
            close: [610, 615, 612, 620, 618, 625, 628, 626, 632, 635, 633, 640, 645, 642, 648],
            volume: [12000000, 13500000, 12800000, 14200000, 13900000, 15000000, 15800000, 14600000, 16200000, 17000000, 16500000, 17500000, 18000000, 17200000, 18500000]
        },
        '2317': {
            dates: ['2026-04-01','2026-04-02','2026-04-03','2026-04-04','2026-04-05','2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10','2026-04-11','2026-04-12','2026-04-13','2026-04-14','2026-04-15'],
            close: [103, 104, 102, 105, 106, 104, 107, 108, 106, 109, 110, 108, 111, 112, 113],
            volume: [8200000, 8900000, 8600000, 9400000, 9800000, 9100000, 10200000, 9800000, 9600000, 10500000, 10800000, 10100000, 11200000, 11500000, 11800000]
        },
        '2454': {
            dates: ['2026-04-01','2026-04-02','2026-04-03','2026-04-04','2026-04-05','2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10','2026-04-11','2026-04-12','2026-04-13','2026-04-14','2026-04-15'],
            close: [1210, 1198, 1205, 1222, 1215, 1230, 1248, 1240, 1255, 1262, 1250, 1275, 1288, 1270, 1295],
            volume: [5600000, 5900000, 5750000, 6100000, 6200000, 6400000, 6600000, 6300000, 6750000, 6900000, 6650000, 7100000, 7350000, 7050000, 7500000]
        },
        'AAPL': {
            dates: ['2026-04-01','2026-04-02','2026-04-03','2026-04-04','2026-04-05','2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10','2026-04-11','2026-04-12','2026-04-13','2026-04-14','2026-04-15'],
            close: [188, 190, 189, 191, 193, 192, 194, 195, 193, 196, 197, 195, 198, 199, 200],
            volume: [52000000, 54500000, 53000000, 55800000, 57000000, 55200000, 58000000, 59500000, 56500000, 61000000, 62000000, 60000000, 63000000, 64000000, 65500000]
        },
        'MSFT': {
            dates: ['2026-04-01','2026-04-02','2026-04-03','2026-04-04','2026-04-05','2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10','2026-04-11','2026-04-12','2026-04-13','2026-04-14','2026-04-15'],
            close: [410, 412, 409, 415, 417, 416, 419, 421, 418, 422, 424, 423, 426, 428, 430],
            volume: [28000000, 29500000, 28800000, 30500000, 31200000, 30000000, 31800000, 32500000, 31000000, 33200000, 34000000, 33500000, 35000000, 36000000, 37000000]
        },
        'GOOGL': {
            dates: ['2026-04-01','2026-04-02','2026-04-03','2026-04-04','2026-04-05','2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10','2026-04-11','2026-04-12','2026-04-13','2026-04-14','2026-04-15'],
            close: [152, 151, 153, 154, 152, 155, 156, 155, 157, 158, 156, 159, 160, 158, 161],
            volume: [24000000, 23500000, 24500000, 25200000, 24800000, 26000000, 26800000, 25500000, 27500000, 28000000, 27000000, 29000000, 29500000, 28500000, 30000000]
        }
    };

    let obvChartInstance = null;
    let lastRenderedSymbol = null;

    const calculateObv = (closeSeries, volumeSeries) => {
        if (!closeSeries || !volumeSeries || closeSeries.length === 0) return [];
        const obv = [0];
        for (let i = 1; i < closeSeries.length; i++) {
            const prev = closeSeries[i - 1];
            const curr = closeSeries[i];
            if (curr > prev) {
                obv.push(obv[i - 1] + volumeSeries[i]);
            } else if (curr < prev) {
                obv.push(obv[i - 1] - volumeSeries[i]);
            } else {
                obv.push(obv[i - 1]);
            }
        }
        return obv;
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
    };

    const buildObvSummary = (symbol, obvSeries) => {
        if (obvSeries.length < 2) return `${symbol}：OBV 資料不足，請稍後再試。`;
        const latest = obvSeries[obvSeries.length - 1];
        const previous = obvSeries[obvSeries.length - 2];
        const delta = latest - previous;
        const trend = delta > 0 ? '上升' : delta < 0 ? '下降' : '持平';
        const descriptor = delta > 0 ? '顯示買盤動能較強' : delta < 0 ? '顯示賣壓增強' : '顯示量價動能平衡';
        return `${symbol}：最新 OBV ${formatNumber(latest)}，日變化 ${formatNumber(delta)}，趨勢${trend}，${descriptor}。`;
    };

    const resolveState = () => {
        const resolvedCurrentStock = typeof currentStock !== 'undefined' ? currentStock : window.currentStock;
        const resolvedAnalysisData = typeof analysisData !== 'undefined' ? analysisData : window.analysisData;
        return {
            symbol: resolvedCurrentStock || resolvedAnalysisData?.stock,
            analysisData: resolvedAnalysisData
        };
    };

    const renderObvChart = (symbol) => {
        const data = MOCK_OBV_DATA[symbol];
        const textEl = document.getElementById('obv-text');
        const canvas = document.getElementById('obv-chart');
        if (!canvas || !textEl) return;

        if (!data) {
            textEl.textContent = `目前沒有 ${symbol} 的示範 OBV 資料。`;
            if (obvChartInstance) {
                obvChartInstance.destroy();
                obvChartInstance = null;
            }
            return;
        }

        const obvSeries = calculateObv(data.close, data.volume);
        textEl.textContent = buildObvSummary(symbol, obvSeries);

        if (obvChartInstance) {
            obvChartInstance.destroy();
        }

        const ctx = canvas.getContext('2d');
        obvChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.dates,
                datasets: [
                    {
                        label: `OBV (${symbol})`,
                        data: obvSeries,
                        borderColor: '#1e88e5',
                        backgroundColor: 'rgba(30, 136, 229, 0.15)',
                        fill: true,
                        tension: 0.35,
                        pointRadius: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `OBV: ${formatNumber(context.parsed.y)}`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { maxTicksLimit: 6 }
                    },
                    y: {
                        title: { display: true, text: 'OBV' },
                        ticks: {
                            callback: (value) => formatNumber(value)
                        }
                    }
                }
            }
        });
    };

    const tryRenderFromState = () => {
        const detailSection = document.getElementById('detail-section');
        const { symbol } = resolveState();
        if (!detailSection || detailSection.style.display === 'none' || !symbol) return;

        if (symbol !== lastRenderedSymbol) {
            lastRenderedSymbol = symbol;
            renderObvChart(symbol);
        }
    };

    const observeDetailSection = () => {
        const detailSection = document.getElementById('detail-section');
        if (!detailSection || typeof MutationObserver === 'undefined') return;
        const observer = new MutationObserver(() => {
            tryRenderFromState();
        });
        observer.observe(detailSection, { attributes: true, attributeFilter: ['style', 'class'] });
    };

    document.addEventListener('DOMContentLoaded', () => {
        const viewDetailBtn = document.getElementById('view-detail-btn');
        if (viewDetailBtn) {
            viewDetailBtn.addEventListener('click', () => {
                setTimeout(tryRenderFromState, 150);
            });
        }

        document.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (btn.dataset.tab === 'technical') {
                    setTimeout(tryRenderFromState, 150);
                }
            });
        });

        window.addEventListener('obv-demo-refresh', () => {
            setTimeout(tryRenderFromState, 100);
        });

        observeDetailSection();
        setInterval(tryRenderFromState, 600);
    });
})();