# Network topology options N0 and N1

**DRAFT · MP-15 · 1 November 2026 · Technical architecture appendix · Unreviewed · No deployment or network choice approved**

This appendix makes the network alternatives explicit alongside the [system blueprint](architecture-blueprint.md) and [technology matrix](tech-stack-matrix.md). It is intended as an inline companion on the MP Confluence architecture page, not a new child page or permission to publish. The current task authorises documentation and a native Lucid diagram only. Account, Region, CIDRs, AZ IDs, resource names, rules and endpoints remain unprovisioned. Full requirements and UX agreement still gate application implementation. Synthetic local/dev fixtures remain local; nothing is loaded into AWS.

## 1. N0: customer-VPC-unattached Lambda as the cost baseline candidate

N0 evaluates the app without attaching its Lambda functions to a customer VPC. Lambda still runs in AWS-managed infrastructure; “unattached” does not mean the function itself is a publicly addressable server. API Gateway is the authenticated application front door. Cognito managed sign-in, verified Apple/Google/passkey linking/recovery, object authorization, least-privilege IAM, encryption and environment isolation are still required.

Use direct outbound TLS from the bounded Lambda workers for Anthropic's API, Yahoo Finance and Twelve Data Grow. The application owns the official Anthropic client SDK loop, read-only tool allowlists, URL/redirect validation, token/time/iteration ceilings and cost admission. An application URL allowlist is not the same control as a network firewall. No Bedrock, AgentCore or Agent SDK runtime is introduced. AWS explains that default Lambda networking has internet access, while a function attached to a customer VPC needs an explicit egress path. [Lambda internet access](https://repost.aws/knowledge-center/internet-access-lambda-function)

CloudFront and Route 53 serve the web entry point. If the static SvelteKit option is selected, a standard private S3 origin uses signed OAC and a distribution-scoped bucket policy, with Block Public Access and encryption. S3 website endpoints do not support this OAC design. OAC protects the origin, not the confidentiality of every viewer response: holdings, imports, chat and cost data must not be baked into static assets or publicly cached. Dynamic SSR remains a separate, unselected adapter/runtime/session decision. [S3 origin protection](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)

N0 accesses S3/DynamoDB through their managed service APIs using IAM/TLS; it has no customer subnet, gateway endpoint, NAT or customer security group. Data buckets/tables remain private by policy. Neither a customer VPC nor a VPN is required simply to make the product owner-only. Public TLS endpoints still require authentication, throttling and application security; a private API/VPN design is a separately costed alternative, not the baseline.

## 2. N1: optional split topology with a private VPC scope

N1 adds a customer VPC only for a demonstrated private-resource or compute-isolation need. It does not attach every internet-facing worker by default. Keep the direct Anthropic/retrieval/market-data functions customer-VPC-unattached; place only justified private jobs or VPC attachments in two isolated private subnets across two AZs. This is a candidate design, not a selected infrastructure plan or an availability guarantee.

Lambda execution remains in the Lambda service. A VPC-configured Lambda uses Hyperplane ENIs to reach the customer network; the diagram distinguishes those attachment interfaces from the service's execution infrastructure. Optional Fargate/SageMaker job networking must be evaluated for the selected execution mode. Two AZs do not turn a single job, a regional dependency or a backup into a multi-region recovery design. [Lambda VPC attachment](https://aws.amazon.com/blogs/compute/using-aws-lambda-iam-condition-keys-for-vpc-settings/)

| Component | Proposed N1 contract | Deliberately absent/unselected |
| --- | --- | --- |
| Customer VPC | CIDR/DNS settings to agree; dev/prod separation under the environment ADR | No inherited MA network/account/Region |
| Private subnet A/B | One isolated subnet per AZ; no public addresses assigned to Lambda; route tables associated explicitly | No default internet route in this split candidate |
| Route tables | VPC local route; same-Region S3/DynamoDB service-prefix routes to gateway endpoints | No claim that an S3 gateway reaches Anthropic, arbitrary URLs or another VPC |
| Workload security group | No unsolicited inbound rules; narrowly scoped role-specific egress, such as required TCP443 service prefixes; application/database inbound only for a separately justified dependency | No shared “allow everything” group; not an HTTP hostname/DNS firewall |
| Gateway endpoints | S3 and DynamoDB route targets, associated with both selected subnet route tables; scoped endpoint policies | Not interface endpoint ENIs and not a reason to put S3/DynamoDB inside the VPC |
| AWS managed services | S3, DynamoDB, Cognito, API Gateway and CloudFront remain outside the customer VPC boundary | They are not deployed into the two private subnets |
| External API roles | Separate unattached Lambda functions retain outbound internet access without customer NAT | No direct inbound path into private subnets from the public API inferred |
| API invocation | AWS service integration invokes an authorized Lambda; private job dispatch/state follows the durable workflow contract | API Gateway invocation is not an inbound socket opened on a Lambda ENI |

Gateway endpoints support their named service in the selected Region; their route and policy scope must match actual access. They have no additional endpoint charge, but the S3/DynamoDB service, requests, storage, backups and compute are still billed. Evaluate DNS resolution, service-prefix routes, network ACL return paths, IAM and endpoint policies together. [S3 gateway endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html), [DynamoDB gateway endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-ddb.html)

Security groups allow traffic by protocol, port, addresses/prefix lists and security-group references; they do not restrict destinations by DNS name. They also cannot block queries to AmazonProvidedDNS/Route 53 Resolver. DNS Firewall or an inspected proxy/firewall would be additional controls with their own coverage and cost decisions, not a capability hidden inside an SG. [Security-group rules](https://docs.aws.amazon.com/vpc/latest/userguide/security-group-rules.html)

## 3. N1-E: conditional public egress if all workers must be VPC-attached

This is an **unselected change to N1**, shown separately so the additional resources and route changes are visible. For classic zonal public NAT, each participating AZ has a public subnet/NAT gateway, the public route table sends `0.0.0.0/0` to an attached internet gateway, and the private subnet's default route points to its same-AZ NAT. Permit only necessary workload egress; NAT itself is connectivity, not destination authorization. Retain the more-specific S3/DynamoDB gateway routes for those services.

Putting Lambda in a public subnet does **not** give it a public IP or internet access. Likewise, an IGW alone does not give a private Lambda ENI an outbound IPv4 path. Do not draw a direct private-subnet-to-IGW shortcut. A one-NAT design may reduce fixed cost but adds an AZ dependency and potentially cross-AZ transfer; two zonal NATs avoid that specific cross-AZ dependency while increasing the monthly floor. Other NAT products/IPv6 strategies require a new compatibility/pricing comparison, not an assumed free equivalent. [Lambda egress requirements](https://repost.aws/knowledge-center/internet-access-lambda-function), [NAT placement/cost](https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-pricing.html)

## 4. Optional private-job service reachability and paid endpoints

Do not assume an isolated subnet can launch every training/container workload using just an S3 gateway. Record a call-by-call dependency matrix for build/pull, start, runtime tools, logging, model/data access, callbacks, cancellation and recovery. A container image pull, a job's training data path and a model API call are different routes.

- For Fargate/ECR workloads without internet, verify both `ecr.api` and `ecr.dkr` interface endpoints, S3 layer access and CloudWatch Logs access for the selected platform/log driver. Other runtime API calls can need additional endpoints. [ECS endpoint considerations](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/vpc-endpoints.html)
- Regional STS is needed only where the actual code/service path calls STS through that network; add KMS or other service endpoints only where the selected runtime uses their APIs. Do not assume every endpoint is mandatory or that all services share one endpoint.
- SageMaker service-side download/logging and a training container's own networking differ, particularly with network isolation. Validate the chosen job's VPC configuration and service-side paths rather than copying the Fargate endpoint list. With network isolation the container cannot freely call the internet or private resources. [SageMaker VPC/network isolation](https://docs.aws.amazon.com/sagemaker/latest/dg/interface-vpc-endpoint.html)
- Each interface endpoint requires service/Region/DNS/endpoint-policy compatibility and an endpoint SG permitting the intended workload SG on the required port. Those endpoint SGs are distinct from the route-based S3/DynamoDB gateway endpoints. New endpoint/logging/control-plane costs require the budget gate.

ML option A portable jobs versus B selective SageMaker remains unselected. The diagram's private-job interfaces and optional paid endpoint box describe capabilities to investigate, not approved Fargate/SageMaker activation or an always-on inference endpoint.

## 5. Policies must preserve every legitimate access path

Keep separate service/role paths for CloudFront OAC web assets, unattached Lambda data access, optional VPC jobs through gateway endpoints, confirmed owner upload/read URLs, CI/deployment and approved recovery tools. Scope each to the required objects/actions/environment and audit it. The static web origin and sensitive raw archive need different viewer/access policies.

A blanket bucket/table deny requiring `aws:SourceVpce` can break CloudFront, unattached workers, console/CI or restoration. AWS's S3 endpoint examples explicitly warn about blocking non-endpoint access. Design resource and endpoint policies together, with narrowly justified principal/service exceptions or separate resources rather than pasting a global deny. A network path does not replace IAM authorization, and an endpoint policy does not grant an otherwise unauthorized principal access. [S3 endpoint policy considerations](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html)

## 6. Cost comparison and decision gate

The confirmed envelope remains **£100 monthly cash all-in**, **£70 operation + £30 reserve**, covering dev/prod, data, Claude/evaluations and operating overhead. No suballocation proves that a VPC/NAT design fits. The shared $200 Anthropic credit is user-reported/unverified and does not offset unrelated AWS networking charges.

| Cost class | Planning formula; Region/rate/tax/FX remain to verify | Implication |
| --- | --- | --- |
| N0 customer-network fixed floor | No customer NAT/interface endpoints introduced by N0 | App, requests, transfer, edge, identity, storage, telemetry and recovery still cost money |
| S3/DynamoDB gateway endpoints | No additional endpoint hourly/data-processing charge | Not a free storage/compute guarantee; only named service routes |
| Classic zonal public NAT | `number of NATs × provisioned hours × regional NAT hourly rate + processed GB × rate + applicable transfer/IPv4 charges` | Idle gateways still incur fixed cost; two AZs can double the gateway-hour floor |
| Interface endpoints | Sum over required services/AZs: `provisioned endpoint-AZ hours × regional rate + processed GB × rate` | An ECR/logging/STS/etc. endpoint portfolio can cost substantially more than one endpoint |
| Flow/DNS/firewall/edge logs | Measured ingestion, storage, queries, rules/requests and retention | Monitoring the network is separately budgeted; sensitive logs need restricted encrypted storage |

AWS prices NAT by provisioned hour plus processed data and applicable transfer, and PrivateLink by endpoint-AZ-hour plus processed data. The [VPC pricing page](https://aws.amazon.com/vpc/pricing/) currently illustrates **$0.045/hour** for its **US East (Ohio)** NAT example: 730 illustrative hours gives **$32.85 for one gateway's hours alone**, before data, applicable IPv4/transfer, tax and GBP conversion. Two at that example rate would be $65.70 for gateway hours alone. **This is not a quote for the unselected project Region or a complete bill.** The fixed floor can threaten the available AWS portion of the all-in budget even with low traffic. [PrivateLink pricing](https://aws.amazon.com/privatelink/pricing/)

Provisional evaluation order: measure N0 as the cost baseline, identify an actual private dependency, then compare the smallest N1 split that addresses it; evaluate N1-E only if all-worker VPC attachment is a requirement. The owner selects the network option after evidence. Neither security nor cost is established merely by adding a VPC icon.

Before implementation approval, record the N0/N1 ADR, full-scope regional cost comparison, complete service/path policy matrix, two-AZ/route/endpoint failure cases, authenticated SSE/adapter proof, endpoint/job bootstrap evidence, source/credit collector behavior, recovery access and source/data deletion controls. This task does not perform cloud connectivity tests, pricing-account calls, policy deployment or independent review.

## 7. Diagram evidence

The editable source is the existing [MP planning Lucidchart](https://lucid.app/lucidchart/02218133-613a-4b78-aea4-e0dba26db386/edit), new **“DRAFT | VPC network options N0-N1 | 2026-11-01”**, page ID `VNMISlFqoQy9` (page 5). The [native PNG](visuals/mp-network-options-native.png), [actual canvas source snapshot](visuals/mp-network-options-source.json) and [network export manifest](visuals/network-lucid-manifest.json) record the saved revision and checks. Existing pages 1–4 are protected from editing. The diagram is proposed physical/logical topology, not live infrastructure or an approved resource inventory; it does not publish to Confluence.
