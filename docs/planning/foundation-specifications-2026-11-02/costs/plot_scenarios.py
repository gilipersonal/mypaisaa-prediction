"""Render a document-only illustration from the proposed cost model; no services."""
from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

BASE=Path(__file__).resolve().parent
model=json.loads((BASE/'model.json').read_text())
row=next(x for x in model['results'] if x['scenario']=='baseline' and x['region']=='us-east-1')
def amount(data,credit):
 return float(next(x['cash_gbp'] for x in row['all_in_variants'] if x['data_option']==data and x['credit_scenario']==credit and x['fx_scenario']=='central'))
blocked='no_verified_credit_optional_claude_blocked'
paid='counterfactual_gross_no_credit_paid_not_authorised'
values=[amount('Grow377_displayed',blocked),amount('Grow55_support_candidate',blocked),amount('Grow377_displayed',paid)]
labels=['Displayed Grow $79 + AWS\nClaude calls blocked without verified credit','Support-reported Grow $29 + AWS\nPrice, availability and use rights unconfirmed','Full-function funding, Grow $79\nCash-funded Claude is not authorised']
plt.rcParams.update({'svg.hashsalt':'mp20-foundation-2026-11-02','font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'axes.spines.left':False})
fig,ax=plt.subplots(figsize=(12,5.4));fig.patch.set_facecolor('#f6f8f5');ax.set_facecolor('#f6f8f5')
bars=ax.barh(range(3),values,color=['#c98b34','#748a80','#576e9b'],height=.56)
bars[1].set_hatch('///');bars[2].set_hatch('..')
ax.set_yticks(range(3),labels);ax.invert_yaxis();ax.set_xlim(0,119)
ax.axvline(70,color='#26704b',linestyle='--',linewidth=1.8,label='£70 planned operation')
ax.axvline(100,color='#a43e3e',linestyle=':',linewidth=2,label='£100 aggregate cash ceiling')
for bar,value in zip(bars,values):ax.text(value+1,bar.get_y()+bar.get_height()/2,f'£{value:.2f}',va='center',weight='bold')
ax.set_xlabel('Illustrative monthly GBP cash requirement');ax.grid(axis='x',alpha=.16);ax.set_axisbelow(True)
handles,legend_labels=ax.get_legend_handles_labels()
fig.legend(handles,legend_labels,loc='lower left',bbox_to_anchor=(.39,.10),frameon=False,fontsize=9)
fig.suptitle('Illustrative cost scenarios · budget approval pending',x=.025,ha='left',weight='bold',fontsize=17)
fig.text(.025,.905,'Assumed £0.80/USD and 20% tax; Virginia candidate; dev + prod combined. No free-tier deductions.',fontsize=10)
fig.text(.025,.035,'The £30 reserve is part of the £100 ceiling. Displayed Grow exceeds the operation plan. Lower-tier rights/availability need proof.\nNo model, subscription, region or live use is selected by this numerical illustration.',fontsize=9,color='#33443b')
fig.subplots_adjust(left=.39,right=.97,top=.83,bottom=.29)
fig.savefig(BASE/'cost-scenarios.svg',metadata={'Date':None});fig.savefig(BASE/'cost-scenarios.png',dpi=160,metadata={'Software':'Foundation specification document illustration'})
print(json.dumps({'cash_gbp':values,'source':'model.json','outputs':['cost-scenarios.svg','cost-scenarios.png'],'live_calls':False}))
