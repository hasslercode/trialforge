import type { McqQuestion } from "@/domain/exam";

/**
 * AWS architecture decision scenarios (not “what does X do” trivia).
 */
export const mcqAwsBank: McqQuestion[] = [
  {
    id: "aws-rds-managed-db",
    prompt:
      "A banking app needs a managed relational database with automated backups, Multi-AZ high availability, and patching handled by AWS. Which service?",
    options: [
      { id: "a", label: "Amazon RDS" },
      { id: "b", label: "Amazon EC2 with self-managed MySQL only" },
      { id: "c", label: "Amazon S3" },
      { id: "d", label: "Amazon CloudFront" },
    ],
    answerId: "a",
    explanation: "RDS is the managed relational option (backups, Multi-AZ, engine patching).",
  },
  {
    id: "aws-api-nodejs-always-on",
    prompt:
      "You must deploy a Node.js API that runs continuously (WebSockets / long-lived connections), with full control of the OS process. Best fit?",
    options: [
      { id: "a", label: "EC2 or ECS (long-running compute) — not Lambda’s request model" },
      { id: "b", label: "Lambda only — ideal for forever-open sockets" },
      { id: "c", label: "S3 static website hosting for the API process" },
      { id: "d", label: "Route 53 alone runs the Node process" },
    ],
    answerId: "a",
    explanation:
      "Lambda is event/request oriented with time limits; always-on Node fits EC2/ECS (or similar).",
  },
  {
    id: "aws-s3-static-assets",
    prompt:
      "Frontend build (HTML/JS/CSS) must be stored durably and served globally with low latency. Typical combo?",
    options: [
      { id: "a", label: "S3 origin + CloudFront CDN" },
      { id: "b", label: "RDS public endpoint" },
      { id: "c", label: "SQS as the web server" },
      { id: "d", label: "IAM users serve files over SSH" },
    ],
    answerId: "a",
    explanation: "S3 stores objects; CloudFront caches at edge locations worldwide.",
  },
  {
    id: "aws-route53-dns",
    prompt:
      "You need DNS failover between a primary and secondary region endpoint for `api.banco.example`. Which service configures health-checked routing?",
    options: [
      { id: "a", label: "Amazon Route 53" },
      { id: "b", label: "Amazon SNS" },
      { id: "c", label: "Amazon DynamoDB" },
      { id: "d", label: "AWS Lambda@Edge only" },
    ],
    answerId: "a",
    explanation: "Route 53 provides DNS policies including failover and health checks.",
  },
  {
    id: "aws-elb-autoscaling",
    prompt:
      "Traffic spikes on a fleet of EC2 web servers. You need to distribute requests and add/remove instances automatically.",
    options: [
      { id: "a", label: "Elastic Load Balancing + Auto Scaling group" },
      { id: "b", label: "Single EC2 + manual IP changes in clients" },
      { id: "c", label: "S3 Transfer Acceleration for HTTP APIs" },
      { id: "d", label: "CloudWatch Alarms alone (no load balancer)" },
    ],
    answerId: "a",
    explanation: "ELB spreads traffic; Auto Scaling reacts to metrics to change capacity.",
  },
  {
    id: "aws-iam-least-privilege",
    prompt:
      "A CI role must upload only to `s3://app-artifacts/*` and nothing else. Correct principle?",
    options: [
      { id: "a", label: "IAM policy with least privilege on that prefix (and needed actions only)" },
      { id: "b", label: "AdministratorAccess on the root account for simplicity" },
      { id: "c", label: "Share root access keys in the pipeline" },
      { id: "d", label: "Disable IAM and use public buckets with no policy" },
    ],
    answerId: "a",
    explanation: "Least privilege via IAM policies/roles — never root keys in CI.",
  },
  {
    id: "aws-lambda-apigw",
    prompt:
      "Occasional webhook traffic (bursty, idle most of the day). Prefer pay-per-invocation with HTTP API front door.",
    options: [
      { id: "a", label: "API Gateway + Lambda" },
      { id: "b", label: "Always-on EC2 24/7 for 10 requests/day" },
      { id: "c", label: "RDS Proxy as the HTTP endpoint" },
      { id: "d", label: "EKS cluster mandatory for webhooks" },
    ],
    answerId: "a",
    explanation: "Serverless HTTP is a classic API Gateway + Lambda pattern for spiky/low traffic.",
  },
  {
    id: "aws-ecs-vs-eks",
    prompt:
      "Team wants containers on AWS with less Kubernetes operational overhead, still orchestrated.",
    options: [
      { id: "a", label: "Amazon ECS (optionally Fargate) — simpler than managing EKS control plane" },
      { id: "b", label: "EKS is always lighter ops than ECS" },
      { id: "c", label: "Lambda runs arbitrary Docker Compose files natively" },
      { id: "d", label: "Amplify replaces all container orchestration" },
    ],
    answerId: "a",
    explanation: "ECS is AWS-native orchestration; EKS adds Kubernetes complexity when you need k8s APIs.",
  },
  {
    id: "aws-dynamodb-session",
    prompt:
      "Session store: single-digit ms reads, key-value access, massive scale, no complex joins.",
    options: [
      { id: "a", label: "Amazon DynamoDB" },
      { id: "b", label: "Amazon RDS with heavy JOINs for every session get" },
      { id: "c", label: "Amazon Glacier Deep Archive" },
      { id: "d", label: "Amazon VPC alone stores sessions" },
    ],
    answerId: "a",
    explanation: "DynamoDB excels at simple key-value / document access at scale.",
  },
  {
    id: "aws-cloudwatch-alarms",
    prompt:
      "You need metrics, logs, and an alarm when 5xx rate exceeds 1% for 5 minutes.",
    options: [
      { id: "a", label: "Amazon CloudWatch (metrics/logs/alarms)" },
      { id: "b", label: "Amazon S3 inventory reports only" },
      { id: "c", label: "Route 53 query logs as the only signal" },
      { id: "d", label: "IAM Access Analyzer for HTTP 5xx" },
    ],
    answerId: "a",
    explanation: "CloudWatch is the default observability hub for AWS resources.",
  },
  {
    id: "aws-sns-fanout",
    prompt:
      "Fraud event must notify email, SMS, and trigger a Lambda — many subscribers, same event.",
    options: [
      { id: "a", label: "Amazon SNS fan-out to multiple subscriptions" },
      { id: "b", label: "SQS as a broadcast pub/sub with multiple competing consumers of one message copy" },
      { id: "c", label: "EC2 user-data scripts polling every hour" },
      { id: "d", label: "CloudFront invalidation for events" },
    ],
    answerId: "a",
    explanation: "SNS is pub/sub fan-out; SQS is a queue (competing consumers) — often SNS→SQS.",
  },
  {
    id: "aws-sqs-decouple",
    prompt:
      "Checkout service must not fail if the email worker is down; buffer jobs and retry.",
    options: [
      { id: "a", label: "Amazon SQS between producer and consumer" },
      { id: "b", label: "Synchronous Lambda invoke only, no buffer" },
      { id: "c", label: "Store jobs in CloudFront cache" },
      { id: "d", label: "Put messages in Route 53 TXT records" },
    ],
    answerId: "a",
    explanation: "SQS decouples producers/consumers with durable buffering and retries.",
  },
  {
    id: "aws-vpc-private-db",
    prompt:
      "RDS must not be reachable from the public internet; only app tier in private subnets.",
    options: [
      {
        id: "a",
        label: "Place DB in private subnets + security groups allowing app SG only (VPC)",
      },
      { id: "b", label: "Bind RDS to 0.0.0.0/0 for easier debugging" },
      { id: "c", label: "Disable VPC and use public IPs for databases" },
      { id: "d", label: "Expose MySQL on CloudFront" },
    ],
    answerId: "a",
    explanation: "Network isolation via VPC subnets + SG least privilege is baseline for banks.",
  },
  {
    id: "aws-s3-vs-ebs",
    prompt:
      "Store millions of user-uploaded KYC PDFs accessible via HTTPS URLs, not as a block device on one VM.",
    options: [
      { id: "a", label: "Amazon S3 object storage" },
      { id: "b", label: "EBS volume attached to a single EC2" },
      { id: "c", label: "ElastiCache as primary document store" },
      { id: "d", label: "SQS payload for multi-MB PDFs as the system of record" },
    ],
    answerId: "a",
    explanation: "Objects/files at scale → S3. EBS is disk for an instance, not a shared object store.",
  },
  {
    id: "aws-cloudfront-https",
    prompt:
      "Terminate TLS close to users and cache GETs for a public marketing site.",
    options: [
      { id: "a", label: "CloudFront distribution in front of the origin" },
      { id: "b", label: "Direct public RDS with SSL" },
      { id: "c", label: "SNS HTTPS subscription as CDN" },
      { id: "d", label: "IAM Identity Center as CDN" },
    ],
    answerId: "a",
    explanation: "CloudFront is the CDN/TLS edge for HTTP(S) content.",
  },
  {
    id: "aws-ecs-fargate-api",
    prompt:
      "Containerized REST API, no EC2 instance management, still always-on tasks behind a load balancer.",
    options: [
      { id: "a", label: "ECS on Fargate + ALB" },
      { id: "b", label: "Lambda zip with 30-minute WebSocket servers" },
      { id: "c", label: "S3 + Glacier instant compute" },
      { id: "d", label: "Only bare-metal EC2 without containers" },
    ],
    answerId: "a",
    explanation: "Fargate runs containers without managing servers; ALB exposes the service.",
  },
  {
    id: "aws-dynamodb-vs-rds",
    prompt:
      "Reporting needs complex multi-table SQL joins and transactions familiar to analysts. Prefer?",
    options: [
      { id: "a", label: "Amazon RDS (or Aurora) for relational SQL workloads" },
      { id: "b", label: "DynamoDB single-table design mandatory for all BI joins" },
      { id: "c", label: "S3 Select as the OLTP database" },
      { id: "d", label: "CloudWatch Metrics as the system of record" },
    ],
    answerId: "a",
    explanation: "Complex joins/SQL analytics fit relational engines; DynamoDB is access-pattern oriented.",
  },
  {
    id: "aws-amplify-vs-ecs",
    prompt:
      "Marketing wants a static Next.js export with Git-based previews. Backend is a separate mature ECS API. Front hosting?",
    options: [
      {
        id: "a",
        label: "Amplify Hosting or S3+CloudFront for the static front; keep API on ECS",
      },
      { id: "b", label: "Put the static site inside RDS" },
      { id: "c", label: "Run HTML from SQS messages" },
      { id: "d", label: "EKS is required for static files" },
    ],
    answerId: "a",
    explanation: "Static/SSR frontends often sit on Amplify or S3+CloudFront while APIs stay on containers.",
  },
];
