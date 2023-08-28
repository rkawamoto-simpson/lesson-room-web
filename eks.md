Authorization to aws

> aws configure

Create cluster

> eksctl create cluster --name simpson-stg --version 1.20 --region ap-northeast-1 --nodegroup-name simpson-stg-workers --node-type t3.medium --nodes 1 --nodes-min 1 --nodes-max 10 --ssh-access --ssh-public-key simpson-stg-ec2 --managed

Scale cluster

> eksctl scale nodegroup --cluster=simpson-stg --nodes=2 --name=simpson-stg-workers2

Delete cluster

> eksctl delete cluster --region=ap-northeast-1 --name=simpson-stg