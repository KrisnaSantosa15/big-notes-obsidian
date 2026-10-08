kalo ada "message" data exchange, kalua tidak ada berarti artifact
An AI company periodically evaluates its systems and processes with the help of independent software vendors (ISVs). The company needs to receive email message notifications when an ISV's compliance reports become available. Which AWS service can the company use to meet this requirement?

AI is a system that can mimic human intelligence
ML is a subset of AI that uses statistics to match/predict based on the pattern
DL is a subset of ML that uses neurons and layers
Gen AI is a type of AI based on DL that could generate new content with varies modalities based on the model capabilities using foundation model
Agentic AI is a Gen AI that could plan and act, tool calling, making decision on its own based on the goal we set.


Training is a concept that we use to teach a model using data.
Inferencing is using a trained model to predict something. There are four different type of inferencing
- Batch: Large prediction in one time
- Real Time: Predict something in a near real time
- Asynchronous: Using queue to process the prediction
- Serverless: auto scaling, pay per use

Interpretability:
Easy to interpret: Less Powerful (Traditional ML)
Hard to interpret: Most Powerful (Deep NN, Gen AI)
human-centered design for explainability: Designing so end users can understand and act on AI outputs

AWS Services:
- Amazon SageMaker AI: Build, Train, Deploy custom model. Lifecycle Included (notebook, training, monitoring, hosting, tuning)
- Sagemaker Model Cards: Documentation of a model’s intended use, training data, and limitations, aiding transparency.
- SageMaker Model Registry: cataloging, versioning, and managing the deployment of trained models
- SageMaker Pipelines: CI/CD service for automating and orchestrating machine learning workflows
- SageMaker Feature Store: centralized repository to store, share, and manage features for ML models
- SageMaker Canvas: visual, point-and-click service designed for business users and analysts with minimal machine learning knowledge
- SageMaker Jumpstart: Ready Made pretrained models inside SageMaker
- Amazon Transcribe: Speech To Text (STT), ASR (Automatic Speech Recognition)
- Amazon Translate: Language Translation
- Amazon Comprehend: NLP->analysis sentiment, Named Entity Recognition, Key Phrases
- Amazon Lex: Conversational Chatbots
- Amazon Poly: Text to Speech (TTS)

- Amazon Bedrock: Access to Foundation models + Knowledge bases, agents, guardrails, prompt management
- Amazon Bedrock AgentCore: managed runtime for securely deploying and scaling AI agent in production
- Amazon Bedrock Prompt Management: Lets teams version, track, and deploy prompts like code artifacts.
- Bedrock Model Evaluations: Built-in tooling to evaluate and compare foundation model performance.
- Amzon Q: GenAI assistant for developers/business users
- Amazon QuickStart: Ready to Use AI Assistant for business intelligence/analytics assistant
- Kiro: AI-powered IDE
- Amazon Rekonition
- Strands Agent: Open Source SDK for building Agent

- Amazon Vector Databases: Opensearch, Aurora, Neptune, RDS for PostgreSQL
- Amazon Neptune: purpose-built, fully managed graph database service designed to handle highly connected datasets
- Amazon OpenSearch: search and analytics engine
- Amazon Aurora: relational database service
- Amazon MemoryDB for Redis is an in-memory, key-value database
- S3 Glacier Deep Archive: storage class for long-term data archiving with retrieval times of several hours

- Amazon Augmented AI (Amazon A2I): service specifically designed to build and manage workflows for human review of machine learning predictions
- Amazon Kendra: intelligent enterprise search service. It is used for indexing and searching documents
- AWS Glue: fully managed, serverless data integration service designed for extract, transform, and load (ETL) tasks
- AWS Data Exchange: facilitate the exchange of data between data providers (like ISVs) and data subscribers (like the AI company)
- Amazon Nova Canvas: generate images
- Amazon CloudFront: content delivery network (CDN) that securely delivers content with low latency and high transfer speeds over the public internet.
- Amazon Bedrock PartyRock: free, web-based, hands-on generative AI application-building playground. It is specifically designed to allow users to learn about and experiment with generative AI and prompt engineering in an intuitive, code-free environment
- Amazon Rekognition: managed service for image and video analysis
- AWS HealthScribe: HIPAA-eligible service specifically designed for the healthcare industry. It uses speech recognition and generative AI to automatically create preliminary clinical documentation from conversations between clinicians and patients
- Amazon Q Developer: generative AI-powered assistant specifically designed for developers to accelerate the software development lifecycle
- Amazon Q Business: generative AI assistant for business users to analyze company data and documents
- Amazon Personalize: fully managed machine learning service designed specifically for creating real-time personalized recommendations
- Amazon EventBridge: serverless event bus used to route events between services. 
- Amazon Macie: data security service that uses machine learning to discover and protect sensitive data (like PII) stored in Amazon S3
- AWS Audit Manager: simplify how users assess risk and compliance with regulations and industry standards
- AWS Trusted Advisor: provides best practice recommendations for cost, performance, and security
- AWS Secrets Manager: service for securely storing and managing credentials and other secrets
- Amazon Inspector: vulnerability management service that scans for software vulnerabilities and network exposures
- AWS Config: continuous resource compliance checks. continuously monitoring and recording AWS resource configurations
- AWS Artifact: on-demand access to AWS compliance reports
- AWS CloudTrail: logs every API call for auditing.  not for capturing the detailed content (input/output data) of the invocation payload
- Trusted Advisor: best-practice recommendations. service for logging and monitoring API calls across AWS services, including Amazon Bedrock
- Amazon CloudWatch: monitoring application performance and collecting operational logs
- IAM: Identity/Access Permission
- Encryption: protecting data
- Amazon Macie: Discovers sensitive Data
- AWS PrivateLink: Connect to a private network avoiding public internet
- Bedrock AgentCore Identity & Policy: Secures an AI agent’s own identity and the permissions it’s allowed to use when acting autonomously.
- data lineage & SageMaker Model Cards: Data lineage = tracking where data came from and how it was transformed. Model Cards also help document data origins.
- prompt injection & output filtering: Prompt injection = malicious input trying to override a model’s instructions. Output filtering = validating/blocking unwanted content in model responses.
- RAG grounding & confidence scoring: Techniques to reduce hallucination
- data residency & retention: Data residency = where data is physically stored/processed (often a regulatory requirement). Retention = how long data is kept before deletion.
- Generative AI Security Scoping Matrix: AWS’s framework for classifying GenAI use cases by risk level and the controls each level requires.



Amazon Payment Types Terms:
- Provisioned Throughput: pay for reserved dedicated capacity
- Token-Based Pricing: input+output token
- Spot Pricing: 
- Pay Per GB Storage Pricing

Traditional ML: Narrow task, explicit
Foundational Model: Generative, Broad task

AI/Model Development Lifecycle
1. Data Collection
2. Exploratory Data Analysis (EDA)
3. Pre-processing & Feature Engineering
4. Training
5. Hyperparameter Tuning
6. Evaluation
7. Deployment
8. Monitoring
9. Retraining as data drifts.

MLOps: Dicipline of running ML in Production


Model Performance Metrics:
- Recall: From all positive, how many positive can be found my the model, Maximize the positive findings
- F1 Score: Harmonic means from Recall and Precision
- Accuracy: how many correct predictions based on the total data
- Precision: From all positive, how many the actual positive, minimize false positives
- MAE
- MSE
- R2
- RUC
- BLEU Score: Overlap metric common for translation, relative translation quality. Bilingual Evaluation Understudy
- ROUGE: Overlap metric common for summarization. Recall-Oriented Understudy for Gisting Evaluation
- BERT Score: Semantic Similarity (not just exact overlap)
- LLM as A Judge: using another LLM to score outputs at scale
- Perplexity: measures how well a language model predicts a sequence of text.
- Frechet Inception Distance (FID): evaluate the quality of images generated by models like GANs, not text.
- Task completion rate: Metrics for evaluating full applications not just raw model
- cost per interaction: did the agent actually complete the task and how much cost?

Business Metrics:
- Cost per User
- Development cost
- Customer feedback
- ROI: return on investment
- ARPU: Average Revenue Per User
- CLV: Customer Lifetime Value



Gen AI Terms:
- Adversarial prompting: identify and address vulnerabilities in Large Language Models (LLMs)
- Tokens: chunk of text a model process, roughly a word/word-piece
- Chunking: A technique to split long documents to smaller pieces
- Embedding: Vector Representation
- Transformer: Attention based Neural network behind the modern LLMs
- Foundational Model: Pretrained Gen Model
- Multi Modal: More than Data type/modalities like text, audio, video, image, etc
- Prompt Caching: reuse a cached prompt to cut latency and cost
- Temperature: control randomness of LLM output (low, deterministic. high, creative/varies)
- Zero shot: No Example in prompt
- Few Shot: few examples in promt
- Chain of Thoughts: asking the model to reason itself before answering
- Prompt Templates: Reuseable, structured prompt format
- Prompt Poisoning: Malicious data to corrupt the context
- Prompt Hijacking: redirecting the model to an unintended task 
- Prompt Jailbreaking: bypass model's safety controls
- Pre-training: Teaching model in a massive general corpus
- Fine Tuning: adapting model on a smaller dataset for specific task
- Continuous Pre-training: another general training for new domain without task specific labels before specific fine tuning
- Distillation: Training a smaller models to mimic a larger one
- Reinforcement Learning from Human Feedback (RLHF): align models output with human preferences
- Instruction Tuning: Fine tuning to make model follow the instruction
- Transfer Learning: Type of tehchnique to allow model adapt to new task

- Context Engineering: Deciding what information (instruction, tool outputs, etc) that should be fitted to a model
- Multi Agent System Patterns: Specialized agent collaborating to do the task
- Model Context Protocol (MCP): A standard way an LLM to interact with external tools
- Memory Management: how an agent retain short/long context
- Tool Usage: Agent calling a tool function
- Workflow orchestration: Coordinating Multi Agent

- Bias Vs Variance: Bias=Underfitting, systemic unfairness. Variance=Overfitting, sensitivity to training data

- Bias: systemic unfairness
- Fairness: equal treatment
- Inclusivity: represent diverse groups 
- Robustness: handle edge cases
- Safety: avoid harms
- Veracity: truthfulness
- Hallucinations: Confident but wrong output
- Interpretability: explain why A is A, why prediction is X, etc
- Non Deterministic/Probabilistic: Same prompt but Not consistent output
- Retrieval Augment Document (RAG): retrieve data from external data/documents and inject them into the prompt

Foundational model Lifecycle:
1. Model selection
2. Pre Training
3. Fine Tuning
4. Evaluation
5. Deployment
6. Feedback
