#!/bin/bash

. /app/.venv/bin/activate

# Function to retrieve single secret from AWS Secrets Manager
retrieve_single_secret() {
    local SECRET_ID="$1"

    # Retrieve the secret value
    secret_dict=$(aws secretsmanager get-secret-value --secret-id "$SECRET_ID" | jq -r ".SecretString")
    if [ -z "$secret_dict" ]; then
        echo "Failed to retrieve secret value." >&2
        return 1  # Return an error code
    fi

    echo "Retrieved secret value successfully."
    ENV_KEY=$(echo "$secret_dict" | jq -r ".env_key")
    ENV_VALUE=$(echo "$secret_dict" | jq -r ".env_value")
    export "$ENV_KEY=$ENV_VALUE"

    echo "Environment exported successfully."
    return 0  # Return success code
}

# Function to retrieve credentials from AWS Secrets Manager
retrieve_secret() {
    local SECRET_ID="$1"
    local USERNAME_KEY="$2"
    local PASSWORD_KEY="$3"

    # Retrieve the secret value
    secret_dict=$(aws secretsmanager get-secret-value --secret-id "$SECRET_ID" | jq -r ".SecretString")

    # Check if the retrieval was successful
    if [ -z "$secret_dict" ]; then
        echo "Failed to retrieve secret value." >&2
        return 1  # Return an error code
    else
        echo "Retrieved secret value successfully."
        PASSWORD_VAL=$(echo "$secret_dict" | jq -r ".password")

        # Export the variables for use in the environment
        if [[ -n "$USERNAME_KEY" ]]; then
            USERNAME_VAL=$(echo "$secret_dict" | jq -r ".username")
            export "$USERNAME_KEY=$USERNAME_VAL"
        fi
        export "$PASSWORD_KEY=$PASSWORD_VAL"

        echo "Credentials exported successfully."
        return 0  # Return success code
    fi
}

# Function to retrieve IP addresses of an AWS ALB
get_alb_ip() {
    local DNS_NAME="$1"  # ALB name or ARN

    # Retrieve the IP addresses associated with the ALB's DNS name using nslookup
    ALB_ARN=$(aws elbv2 describe-load-balancers --query "LoadBalancers[?DNSName=='$DNS_NAME'].LoadBalancerArn" --output text)
    ALB_IPS=$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query "LoadBalancers[0].DNSName" --output text | xargs nslookup | grep 'Address:' | tail -n +2 | awk '{print $2}')
    echo "Resolved ALB IPs: $ALB_IPS"

    if [[ -z "$ALB_IPS" ]]; then
        echo "No IP addresses found for ALB: $DNS_NAME"
        return 1
    else
        # Merge the remaining IP addresses into a comma-separated string
        local IP_STRING=$(echo "$ALB_IPS" | tr '\n' ',' | sed 's/,$//')  # Remove trailing comma
        echo "IP addresses for ALB ($DNS_NAME):"
        echo "$IP_STRING"
        export "LB_IP_LIST=$IP_STRING"
        return 0
    fi
}

if [[ $REQUIRE_MQ_AUTH == "TRUE" && $ENV_LOCALE == *"cloud"* ]]; then
    SECRET_ID="tm-$ENV_TYPE-$SECRET_MQ_USER"
    echo "Retrieving $SECRET_ID ..."
    retrieve_secret "$SECRET_ID" "MQ_USERNAME" "MQ_PASSWORD"
fi

if [[ $REQUIRE_REDIS_AUTH == "TRUE" && $ENV_LOCALE == *"cloud"* ]]; then
    SECRET_ID="tm-$ENV_TYPE-$SECRET_ELASTICACHE"
    echo "Retrieving $SECRET_ID ..."
    retrieve_secret "$SECRET_ID" "" "REDIS_PASSWORD"
fi

if [[ $REQUIRE_DB_AUTH == "TRUE" && $ENV_LOCALE == *"cloud"* ]]; then
    SECRET_ID="tm-$ENV_TYPE-$SECRET_DOCDB"
    echo "Retrieving $SECRET_ID ..."
    retrieve_secret "$SECRET_ID" "DB_USERNAME" "DB_PASSWORD"
fi

python -m scripts.uvicorn.server
