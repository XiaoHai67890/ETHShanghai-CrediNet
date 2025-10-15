use axum::{
    extract::State,
    http::{StatusCode, HeaderMap},
    response::IntoResponse,
    Json,
};
use crate::shared::jwt::AppState;
use crate::shared::errors::AppError;
use crate::shared::types::{ApiResponse, LoginRequest, LoginResponse, SendCodeRequest, Claims};
use crate::auth::services::AuthService;
use super::services::ApiService;
use crate::shared::rate_limit::{check_rate_limit, RateLimiterConfig, client_key};
use crate::shared::audit::write_audit;
use super::types::*;

// ========== 统一响应帮助 ==========
fn ok<T: serde::Serialize>(data: T) -> impl IntoResponse {
    (StatusCode::OK, Json(ApiResponse::success(data)))
}

fn ok_msg(message: &str) -> impl IntoResponse {
    (StatusCode::OK, Json(ApiResponse::<()>::success_msg(message)))
}

// ========== Auth ========== 
pub async fn api_send_code(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<SendCodeRequest>,
) -> Result<impl IntoResponse, AppError> {
    // 限流：发送验证码接口
    check_rate_limit(
        state.rate_limiter.clone(),
        format!("send_code:{}", client_key(&headers)),
        &RateLimiterConfig { burst: 5, window: std::time::Duration::from_secs(300) },
    )?;
    let service = AuthService::new(state.db.clone(), state.jwt_secret.clone());
    service.send_verification_code(&payload.contact).await?;
    write_audit(&state.db, None, "auth.send_code", serde_json::json!({"contact": payload.contact})).await;
    Ok(ok_msg("code sent"))
}

pub async fn api_login(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    check_rate_limit(
        state.rate_limiter.clone(),
        format!("login:{}", client_key(&headers)),
        &RateLimiterConfig { burst: 10, window: std::time::Duration::from_secs(60) },
    )?;
    let service = AuthService::new(state.db.clone(), state.jwt_secret.clone());
    let (access_token, refresh_token, user_id, expires_in) = service.verify_code_and_login(&payload.contact, &payload.code).await?;
    write_audit(&state.db, Some(&user_id), "auth.login", serde_json::json!({"contact": payload.contact})).await;
    Ok(ok(LoginResponse { access_token, refresh_token, user_id, expires_in }))
}

// ========== User ==========
pub async fn get_user_profile(
    State(state): State<AppState>,
    claims: Claims,
) -> Result<impl IntoResponse, AppError> {
    let service = ApiService::new(state.db.clone());
    let profile = service.get_user_profile(&claims.sub).await?;
    write_audit(&state.db, Some(&claims.sub), "user.profile", serde_json::json!({})).await;
    Ok(ok(profile))
}

pub async fn bind_social(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<BindSocialRequest>,
) -> Result<impl IntoResponse, AppError> {
    let service = ApiService::new(state.db.clone());
    let result = service.bind_social(&claims.sub, &payload.provider, &payload.code, payload.redirect_uri.as_deref()).await?;
    write_audit(&state.db, Some(&claims.sub), "user.bind_social", serde_json::json!({"provider": payload.provider})).await;
    Ok(ok(result))
}

// ========== Credit ==========
pub async fn get_credit_score(
    State(state): State<AppState>,
    claims: Claims,
) -> Result<impl IntoResponse, AppError> {
    let service = ApiService::new(state.db.clone());
    let score = service.get_credit_score(&claims.sub).await?;
    write_audit(&state.db, Some(&claims.sub), "credit.get_score", serde_json::json!({})).await;
    Ok(ok(score))
}

// ========== SBT ==========
pub async fn issue_sbt(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<IssueSbtRequest>,
) -> Result<impl IntoResponse, AppError> {
    let service = ApiService::new(state.db.clone());
    let result = service.issue_sbt(&claims.sub, &payload.sbt_type).await?;
    write_audit(&state.db, Some(&claims.sub), "sbt.issue", serde_json::json!({"sbt_type": payload.sbt_type})).await;
    Ok(ok(result))
}


