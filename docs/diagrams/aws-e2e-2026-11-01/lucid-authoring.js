// Reusable Lucid RunScript V2 authoring source for the MP-18 dated diagram snapshot.
// __TARGET__ is replaced with one of request, events, forecasting by the caller.
// This script appends a page to the existing MP document; it never edits older pages.
const targetKey = '__TARGET__';
const icons = {
  route53:'ArchAmazonRoute53AWS2024', cloudfront:'ArchAmazonCloudFrontAWS2024', s3:'ArchAmazonSimpleStorageServiceAWS2024',
  cognito:'ArchAmazonCognitoAWS2024', apigw:'ArchAmazonAPIGatewayAWS2024', lambda:'ArchAWSLambdaAWS2024',
  dynamo:'ArchAmazonDynamoDBAWS2024', scheduler:'ResAmazonEventBridgeSchedulerAWS2024', sqs:'ArchAmazonSimpleQueueServiceAWS2024',
  bus:'ArchAmazonEventBridgeAWS2024', sns:'ArchAmazonSimpleNotificationServiceAWS2024', step:'ArchAWSStepFunctionsAWS2024',
  sagemaker:'ArchAmazonSageMakerAWS2024', cloudwatch:'ArchAmazonCloudWatchAWS2024', xray:'ArchAWSXRayAWS2024',
  cloudtrail:'ArchAWSCloudTrailAWS2024', budgets:'ArchAWSBudgetsAWS2024', cost:'ArchAWSCostExplorerAWS2024',
  backup:'ArchAWSBackupAWS2024', iam:'ArchAWSIdentityandAccessManagementAWS2024', kms:'ArchAWSKeyManagementServiceAWS2024',
  secrets:'ArchAWSSecretsManagerAWS2024'
};
const paints={experience:'#e5f1ff',edge:'#eae8fb',data:'#e5f4ec',work:'#fff1dc',science:'#f2e8fa',research:'#ffe9ed',ops:'#e4f4f5',control:'#fff3dc'};
const defs={
 request:{title:'MP-18 | AWS request-to-outcome topology | PROPOSED',tab:'#3178b7',rows:[
  {title:'01  Owner, sign-in and delivery edge',group:'experience',nodes:[
   ['owner','Web PWA + native Apple','Owner only; no broker orders',null,'CLIENT'],['dns','Route 53','DNS; chosen domain pending','route53'],['cdn','CloudFront','TLS + static shell; OAC planned','cloudfront'],['shell','S3 static shell','No holdings in build/cache','s3'],['auth','Cognito user pool','Apple / Google / passkeys','cognito'],['policy','Owner session gate','Verified linking + protected actions',null,'POLICY']]},
  {title:'02  Authenticated requests and durable truth',group:'edge',nodes:[
   ['gateway','API Gateway REST','/api/v1; response STREAM test','apigw'],['fastapi','FastAPI Lambda','AuthZ, schema, idempotency','lambda'],['state','DynamoDB preferred','Ledger, job, outbox, approvals','dynamo'],['raw','S3 private evidence','Originals, snapshots, artefacts','s3'],['stream','Streaming Lambda','Python adapter; bounded SSE','lambda'],['read','Read-model snapshot','Cursor expiry => resync',null,'STATE']]},
  {title:'03  Scheduled and queued work',group:'work',nodes:[
   ['schedule','EventBridge Scheduler','Market / outcome / briefing clock','scheduler'],['queue','SQS work queue','At-least-once; concurrency cap','sqs'],['worker','Worker Lambda','Claim job; dedupe effects','lambda'],['dlq','SQS worker DLQ','Exhausted item investigation','sqs'],['eventbus','EventBridge event bus','Optional typed fan-out only','bus'],['notification','SNS / push adapter','Evidence-linked notification','sns']]},
  {title:'04  Data and numerical forecast path',group:'science',nodes:[
   ['providers','Yahoo + Twelve Grow','Rights, freshness, quotas open',null,'EXTERNAL'],['ingest','Data Lambda','Canonical ID, FX, calendar','lambda'],['features','S3 feature snapshots','Point-in-time versions + hashes','s3'],['train','SageMaker AI','Bounded CPU train / eval jobs','sagemaker'],['registry','Approved model artefact','S3 + version / approval pointer','s3'],['infer','Forecast Lambda','Approved artefact; daily forecast','lambda']]},
  {title:'05  Claude research crosses the AWS boundary',group:'research',nodes:[
   ['agent','Agent coordinator Lambda','One code loop; four proposed routes','lambda'],['gate','Tool / policy gate','Read-only tools; budget reservation',null,'POLICY'],['claude','Anthropic platform','Haiku batch / Sonnet live',null,'EXTERNAL'],['batch','Batch collector Lambda','Custom IDs, poll and reconcile','lambda'],['answer','Cited response store','Prompt / evidence / usage versions','dynamo'],['live','SSE + UI projection','Chat deltas provisional to final',null,'CLIENT']]},
  {title:'06  Monitoring, security, cash and restore',group:'ops',nodes:[
   ['logs','CloudWatch','Metrics, logs, alarms; redacted','cloudwatch'],['traces','X-Ray / OTel','Trace / run correlation; sampled','xray'],['trail','CloudTrail','Management baseline; data optional','cloudtrail'],['money','Budgets + Cost Explorer','Delayed AWS billing collection','budgets'],['restore','AWS Backup / S3','Restore + deletion proof planned','backup'],['roles','IAM / KMS','Least privilege + encryption','iam']]}
 ],edges:[
  ['owner','dns','DNS'],['dns','cdn','route'],['cdn','shell','static'],['auth','policy','claims'],
  ['gateway','fastapi','command'],['fastapi','state','commit'],['fastapi','raw','signed upload'],['gateway','stream','SSE'],['stream','read','cursor'],
  ['schedule','queue','enqueue'],['queue','worker','poll'],['queue','dlq','exhaust'],['worker','eventbus','event'],['eventbus','notification','fan-out'],
  ['providers','ingest','licensed data'],['ingest','features','snapshot'],['features','train','fold input'],['train','registry','candidate'],['registry','infer','approved'],
  ['agent','gate','tool use'],['gate','claude','HTTPS SDK'],['claude','batch','async result'],['batch','answer','reconcile'],['answer','live','final ID'],
  ['owner','gateway','HTTPS'],['fastapi','agent','chat job'],['fastapi','queue','durable job'],['state','read','projection'],['state','agent','read context'],['infer','state','forecast'],['worker','logs','telemetry'],['agent','logs','usage']]
 },
 events:{title:'MP-18 | EventBridge, SQS, Anthropic batch and SageMaker | PROPOSED',tab:'#ba7942',rows:[
  {title:'A  Clock to durable work; no client connection required',group:'work',nodes:[
   ['clock','EventBridge Scheduler','Every 30 min where permitted','scheduler'],['scheduleDLQ','Scheduler target DLQ','Failure to invoke target','sqs'],['workq','SQS data queue','At-least-once + backlog alarm','sqs'],['claim','Data worker Lambda','Idempotent job claim','lambda'],['source','Yahoo / Twelve Grow','Licensed listing / quota check',null,'EXTERNAL'],['raw','S3 + DynamoDB','Snapshot + job status','s3']]},
  {title:'B  Domain event and selective fan-out',group:'data',nodes:[
   ['outbox','DynamoDB outbox','Commit before publish; replay safe','dynamo'],['relay','Outbox relay Lambda','Dispatch retries + reconciliation','lambda'],['bus','EventBridge bus','Typed events to multiple targets','bus'],['alertq','SQS alert queue','Material risk after code rules','sqs'],['alert','Notification Lambda','Quiet hours + dedupe','lambda'],['workerDLQ','Worker DLQ','Investigate exhausted work','sqs']]},
  {title:'C  SageMaker training and owner promotion',group:'science',nodes:[
   ['trainClock','Bounded training trigger','Proposed <= monthly CPU cycle','scheduler'],['mlq','SQS ML job queue','Admission and quota guard','sqs'],['orchestrator','Workflow coordinator','Step Functions vs code open','step'],['train','SageMaker AI CPU','Train F3 / F5 challengers','sagemaker'],['evaluation','Walk-forward evaluator','Purge, leakage, calibration',null,'CODE'],['approval','Owner approval pointer','Shadow evidence then promotion','dynamo']]},
  {title:'D  Immediate chat versus overnight Haiku',group:'research',nodes:[
   ['chat','FastAPI chat request','Authenticated; reserve max cost','apigw'],['coordinator','SDK loop Lambda','1 code coordinator / 4 routes','lambda'],['policy','Tool / Figure checks','Allowlist, evidence and numbers',null,'POLICY'],['sonnet','Anthropic Sonnet','Live explanation / thesis',null,'EXTERNAL'],['stream','SSE Lambda','Provisional deltas; durable final','lambda'],['answer','Conversation store','Messages + cost + evidence IDs','dynamo']]},
  {title:'E  Nonurgent batch from the MA design',group:'research',nodes:[
   ['dedupe','New-source filter','Deduplicate article / filing IDs',null,'CODE'],['batchq','SQS batch queue','Only eligible nonurgent items','sqs'],['submit','Batch submit Lambda','Reserve budget; custom IDs','lambda'],['haiku','Anthropic Haiku Batch','Async tags / sampled judges',null,'EXTERNAL'],['poll','Batch poll Lambda','Scheduled; may take 24 h','lambda'],['result','Result ledger + S3','Match ID; partial/expired state','dynamo']]},
  {title:'F  Failure, cost and complete tracing',group:'ops',nodes:[
   ['alarm','CloudWatch alarms','Queue age, DLQ, stale batches','cloudwatch'],['traces','X-Ray / OTel','run_id + model + cache tokens','xray'],['bill','Provider + AWS billing','6h Claude / daily AWS, delayed','cost'],['guard','Budget admission','£60 / £75 / £85 policy',null,'CODE'],['fallback','Fallback / abstain','No paid or urgent batch retry',null,'POLICY'],['investigate','Owner investigation','Audit, replay, promotion',null,'OWNER']]}
 ],edges:[
  ['clock','workq','target'],['clock','scheduleDLQ','invoke fail'],['workq','claim','poll'],['claim','source','fetch'],['source','raw','validate'],
  ['outbox','relay','unpublished'],['relay','bus','publish'],['bus','alertq','filter'],['alertq','alert','consume'],['alertq','workerDLQ','exhaust'],
  ['trainClock','mlq','enqueue'],['mlq','orchestrator','claim'],['orchestrator','train','bounded job'],['train','evaluation','artifact'],['evaluation','approval','owner gate'],
  ['chat','coordinator','direct'],['coordinator','policy','pre-tool'],['policy','sonnet','request'],['sonnet','stream','delta'],['stream','answer','final'],
  ['dedupe','batchq','eligible'],['batchq','submit','claim'],['submit','haiku','custom ID'],['haiku','poll','batch status'],['poll','result','reconcile'],
  ['workq','alarm','backlog'],['batchq','alarm','age'],['coordinator','traces','span'],['submit','guard','reserve'],['bill','guard','reconcile'],['result','fallback','late/failed'],['fallback','investigate','escalate']]
 },
 forecasting:{title:'MP-18 | Forecasting science plus Claude evidence | PROPOSED',tab:'#8353b2',rows:[
  {title:'F1  Point-in-time inputs: the hard boundary',group:'data',nodes:[
   ['feed','Yahoo + Twelve Grow','Rights, timestamps, GBX/FX units',null,'EXTERNAL'],['raw','S3 immutable raw','Versions + source hashes','s3'],['quality','Quality / calendar gate','Stale, gaps, sessions, revisions',null,'CODE'],['ledger','Portfolio ledger','Confirmed cash flows + XIRR','dynamo'],['snapshot','As-of feature dataset','Available then, never future','s3'],['lineage','Feature provenance','IDs, cutoffs, manifests','dynamo']]},
  {title:'F2 to F5  Baselines, features and ML families',group:'science',nodes:[
   ['rules','Rules + XIRR','Deterministic; not probabilities',null,'CODE'],['baseline','Statistical baseline','Bootstrap / simple comparison',null,'CODE'],['f3','F3 risk / regime','Proposed calibrated regression',null,'MODEL 1'],['f4','F4 analog / events','Coded event statistics',null,'CODE'],['f5','F5 direction / range','Proposed boosted / quantile',null,'MODEL 2'],['haiku','Haiku factor tags','Batch, no numerical score',null,'EXTERNAL']]},
  {title:'SageMaker AI  Bounded candidate train / evaluate / register',group:'science',nodes:[
   ['schedule','ML candidate admission','<= monthly CPU trial proposal','scheduler'],['train','SageMaker AI train','No always-on endpoint / GPU','sagemaker'],['walk','Walk-forward folds','Purge + train-only fit',null,'SCIENCE'],['calibrate','Mature label evaluation','Calibration, error, coverage',null,'SCIENCE'],['shadow','Shadow registry','Dataset + model artefact hashes','s3'],['owner','Owner promotion gate','Approval + rollback pointer','dynamo']]},
  {title:'F6 and F7  Daily forecasts, scenarios, proof and advice',group:'experience',nodes:[
   ['inference','Forecast Lambda','Approved pooled model artefact','lambda'],['horizons','Horizon outputs','Next day / 5-20d / 3-12mo',null,'MODEL'],['scenario','3-5 year scenarios','Not mature forecast probability',null,'SCENARIO'],['proof','F6 evidence panel','Rules/ML/LLM disagreement',null,'UX'],['strategy','F7 what-if','Add, hold, pause, trim, rebalance',null,'CODE'],['publish','Immutable forecast','As-of, model, range, cutoff','dynamo']]},
  {title:'MA-inspired LLM evidence, adapted to MP',group:'research',nodes:[
   ['news','Deduplicated news / filing','20-30 holdings initial scope',null,'INPUT'],['batch','Haiku Message Batch','Nonurgent entity / event tags',null,'EXTERNAL'],['relevance','Exposure relevance','Code weights; labelled sample QA',null,'CODE'],['sonnet','Sonnet live research','Four task routes / citations',null,'EXTERNAL'],['guard','Tool + figure gate','Budget, tools, prompt taint',null,'POLICY'],['answer','Cited chat answer','Cannot promote or trade','dynamo']]},
  {title:'F8 and loop  Only outcomes train better candidates',group:'ops',nodes:[
   ['patterns','F8 pattern detectors','Validated features, not a model',null,'CODE'],['outcome','Mature outcomes','Canonical market/FX grade','dynamo'],['score','Calibration scoreboard','Backtest / shadow / live separate',null,'SCIENCE'],['ablation','Factor ablation','LLM additions must earn value',null,'SCIENCE'],['proposal','Experiment proposal','No self-promoting weights',null,'POLICY'],['review','Owner review','Thresholds + recost still open',null,'OWNER']]}
 ],edges:[
  ['feed','raw','ingest'],['raw','quality','validate'],['quality','snapshot','as-of'],['ledger','snapshot','eligible'],['snapshot','lineage','manifest'],
  ['rules','baseline','compare'],['baseline','f3','challenger'],['f3','f4','feature'],['f4','f5','challenger'],['haiku','f5','versioned tag'],
  ['schedule','train','bounded CPU'],['train','walk','artifact'],['walk','calibrate','held out'],['calibrate','shadow','register'],['shadow','owner','approve'],
  ['inference','horizons','forecast'],['horizons','scenario','distinct'],['horizons','proof','uncertainty'],['proof','strategy','eligible'],['strategy','publish','no trade'],
  ['news','batch','custom ID'],['batch','relevance','typed tags'],['relevance','sonnet','evidence'],['sonnet','guard','check'],['guard','answer','cite'],
  ['patterns','outcome','feature lineage'],['outcome','score','maturity'],['score','ablation','compare'],['ablation','proposal','candidate'],['proposal','review','owner gate'],
  ['snapshot','train','fold input'],['owner','inference','version pointer'],['publish','outcome','later'],['answer','proof','explanation']]
 }
};
// Keep only the readable, adjacent, causally valid arrows on canvas. The source
// registry preserves all direct and cross-lane joins; avoid lines across text.
const visible={
 request:['owner>dns','dns>cdn','cdn>shell','auth>policy','gateway>fastapi','fastapi>state','stream>read','schedule>queue','queue>worker','eventbus>notification','providers>ingest','ingest>features','features>train','train>registry','registry>infer','agent>gate','gate>claude','batch>answer','answer>live'],
 events:['clock>workq','workq>claim','claim>source','source>raw','outbox>relay','relay>bus','bus>alertq','alertq>alert','trainClock>mlq','mlq>orchestrator','orchestrator>train','train>evaluation','evaluation>approval','chat>coordinator','coordinator>policy','policy>sonnet','sonnet>stream','stream>answer','dedupe>batchq','batchq>submit','submit>haiku','haiku>poll','poll>result','bill>guard','guard>fallback','fallback>investigate'],
 forecasting:['feed>raw','raw>quality','ledger>snapshot','snapshot>lineage','schedule>walk','walk>train','train>calibrate','calibrate>shadow','shadow>owner','inference>horizons','proof>strategy','strategy>publish','news>batch','batch>relevance','relevance>sonnet','sonnet>guard','guard>answer','outcome>score','score>ablation','ablation>proposal','proposal>review']
};
const spec=defs[targetKey];if(!spec)throw new Error('Unknown diagram page key');
const existingPage=skills.basecanvasediting.getPages().find(page=>page.title===spec.title);
if(existingPage)return {key:targetKey,pageId:existingPage.id,status:'already exists; no new page created'};
if(targetKey==='events')spec.rows[0].nodes=[spec.rows[0].nodes[0],...spec.rows[0].nodes.slice(2),spec.rows[0].nodes[1]];
if(targetKey==='forecasting')[spec.rows[2].nodes[1],spec.rows[2].nodes[2]]=[spec.rows[2].nodes[2],spec.rows[2].nodes[1]];
if(targetKey==='forecasting')spec.edges.unshift(['schedule','walk','split then train'],['walk','train','fold-specific train'],['train','calibrate','candidate evaluation']);
const newPageId=skills.pages.addPage({title:spec.title,tabColor:spec.tab,backgroundColor:'#ffffff'});
if(!skills.basecanvasediting.navigateToPage(newPageId))throw new Error('New page missing');
const base=skills.basecanvasediting;const anchor=base.findSpace({width:1880,height:2200,nearX:20,nearY:20});
const title=await base.createBlock({className:'DefaultSquareBlock',label:spec.title+'\nDRAFT architecture; planned service topology, no AWS resources deployed; source: MP-18',x:anchor.x+40,y:anchor.y+15,width:1800,height:75});
base.editBlockStyle({itemId:title.id,fillColor:'#e8f3fa',lineColor:'#567189',lineWidth:1});
const cards={},created=[title.id],iconIds=[],lineIds=[],labels=[];
for(let row=0;row<spec.rows.length;row++){
 const r=spec.rows[row];const ry=anchor.y+145+row*335;
 const heading=await base.createBlock({className:'DefaultSquareBlock',label:r.title,x:anchor.x+40,y:ry-47,width:1800,height:39});
 base.editBlockStyle({itemId:heading.id,fillColor:paints[r.group],lineColor:'#9aafc0',lineWidth:1});created.push(heading.id);
 for(let col=0;col<r.nodes.length;col++){
  const [key,name,detail,icon,tag]=r.nodes[col],x=anchor.x+45+col*298;
  const badge=icon?await base.createBlock({shapeId:icons[icon],libraryId:'aws2024.js',x:x+83,y:ry,width:62,height:62}):await base.createBlock({className:'DefaultSquareBlock',label:tag||'CODE',x:x+58,y:ry+11,width:120,height:37});
  if(!icon)base.editBlockStyle({itemId:badge.id,fillColor:paints[r.group],lineColor:'#506b7a',lineWidth:1});
  const card=await base.createBlock({className:'DefaultSquareBlock',label:name+'\n'+detail,x,y:ry+153,width:236,height:115});
  base.editBlockStyle({itemId:card.id,fillColor:paints[r.group],lineColor:'#506b7a',lineWidth:1});
  cards[key]=card.id;created.push(badge.id,card.id);if(icon)iconIds.push(badge.id);labels.push(name);
 }
}
const rank=key=>{for(let row=0;row<spec.rows.length;row++){const col=spec.rows[row].nodes.findIndex(n=>n[0]===key);if(col>=0)return row*10+col;}throw new Error('Unknown card key '+key);};
const selected=spec.edges.filter(([a,b])=>visible[targetKey].includes(a+'>'+b)).sort((a,b)=>rank(a[0])-rank(b[0]));
for(let i=0;i<selected.length;i++){const [a,b]=selected[i];if(!cards[a]||!cards[b])throw new Error('Unknown edge '+a+' -> '+b);const e=base.createLine({from:{kind:'block',blockId:cards[a]},to:{kind:'block',blockId:cards[b],style:'Arrow'},shape:'elbow',label:String(i+1).padStart(2,'0'),style:{lineColor:'#577189',lineWidth:1.4}});lineIds.push(e.lineId);}
const validation=await base.validateCanvas({itemIds:[...created,...lineIds],validators:['blockOverlap','disconnectedEndpoint','textOverflow','textContrast']});
return {key:targetKey,pageId:newPageId,title:spec.title,rows:spec.rows.length,cards:Object.keys(cards).length,nativeAwsIcons:iconIds.length,connectors:lineIds.length,validation};
