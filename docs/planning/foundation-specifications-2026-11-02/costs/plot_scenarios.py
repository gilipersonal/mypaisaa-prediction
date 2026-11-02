"""Render a document-only illustration from the proposed cost model; no services."""
from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

BASE = Path(__file__).resolve().parent
model = json.loads((BASE / 'model.json').read_text())
row = next(x for x in model['results'] if x['scenario'] == 'baseline' and x['region'] == 'us-east-1')


def amount(data, credit, timing):
    variant = next(x for x in row['all_in_run_rate_variants'] if x['data_option'] == data and x['credit_scenario'] == credit and x['fx_scenario'] == 'central')
    return float(next(x['cash_gbp'] for x in variant['cash_timing_variants'] if x['timing'] == timing))


blocked = 'no_verified_credit_optional_claude_blocked'
paid = 'counterfactual_gross_no_credit_paid_not_authorised'
scenarios = [('Grow377_displayed', blocked), ('Grow55_support_candidate', blocked), ('Grow377_displayed', paid)]
ordinary = [amount(data, credit, 'ordinary_month') for data, credit in scenarios]
invoice = [amount(data, credit, 'annual_domain_invoice_month') for data, credit in scenarios]
labels = ['Displayed Grow $79 + AWS\nClaude blocked without verified credit', 'Support-reported Grow $29 + AWS\nPrice and use rights unconfirmed', 'Full-function funding, Grow $79\nCash-funded Claude is not authorised']
plt.rcParams.update({'svg.hashsalt': 'mp20-foundation-2026-11-02', 'font.family': 'DejaVu Sans', 'font.size': 11, 'axes.spines.top': False, 'axes.spines.right': False, 'axes.spines.left': False})
fig, ax = plt.subplots(figsize=(12.6, 6.4))
fig.patch.set_facecolor('#f6f8f5')
ax.set_facecolor('#f6f8f5')
for values, offset, color, hatch, label in (
    (ordinary, -.17, '#748a80', None, 'Ordinary month: no domain invoice due'),
    (invoice, .17, '#c98b34', '///', 'Illustrative annual-domain invoice month: full $15 due'),
):
    bars = ax.barh([n + offset for n in range(3)], values, color=color, height=.29, hatch=hatch, label=label)
    for bar, value in zip(bars, values):
        ax.text(value + 1, bar.get_y() + bar.get_height() / 2, f'£{value:.2f}', va='center', weight='bold', fontsize=10, zorder=5, bbox={'facecolor': '#f6f8f5', 'edgecolor': 'none', 'pad': 1})
ax.set_yticks(range(3), labels)
ax.invert_yaxis()
ax.set_xlim(0, 127)
ax.axvline(70, color='#26704b', linestyle='--', linewidth=1.8, label='£70 planned operation')
ax.axvline(100, color='#a43e3e', linestyle=':', linewidth=2, label='£100 aggregate cash ceiling')
ax.set_xlabel('Illustrative invoice-month GBP cash requirement (annual fee is not amortised)')
ax.grid(axis='x', alpha=.16)
ax.set_axisbelow(True)
handles, legend_labels = ax.get_legend_handles_labels()
fig.legend(handles, legend_labels, loc='lower left', bbox_to_anchor=(.37, .09), frameon=False, fontsize=9)
fig.suptitle('Cash timing changes budget headroom · approval pending', x=.025, ha='left', weight='bold', fontsize=17)
fig.text(.025, .91, 'Assumed £0.80/USD and 20% tax; Virginia candidate; dev + prod combined. No free-tier deductions.', fontsize=10)
fig.text(.025, .035, 'The £30 reserve is inside the £100 ceiling. Grow $79 exceeds it in the illustrative annual invoice month, even with Claude blocked.\nNo domain purchase, actual due month, model, subscription, region or live use is selected; lower-tier price and rights remain conditional.', fontsize=9, color='#33443b')
fig.subplots_adjust(left=.37, right=.97, top=.83, bottom=.34)
fig.savefig(BASE / 'cost-scenarios.svg', metadata={'Date': None})
fig.savefig(BASE / 'cost-scenarios.png', dpi=160, metadata={'Software': 'Foundation specification document illustration'})
svg = BASE / 'cost-scenarios.svg'
svg.write_text('\n'.join(line.rstrip() for line in svg.read_text().splitlines()) + '\n')
print(json.dumps({'ordinary_month_cash_gbp': ordinary, 'annual_domain_invoice_month_cash_gbp': invoice, 'source': 'model.json', 'outputs': ['cost-scenarios.svg', 'cost-scenarios.png'], 'live_calls': False}))
