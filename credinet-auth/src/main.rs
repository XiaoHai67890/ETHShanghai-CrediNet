use axum::Router;
use dotenvy::dotenv;
use sqlx::SqlitePool;
use std::env;
use tokio::net::TcpListener;

mod auth;
mod did;
mod identity;
mod authorization;
mod credit;
mod sbt;
mod api;
mod shared;

use shared::jwt::AppState;
use shared::database::init_database;
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    
    // 确保数据库文件路径正确
    let default_db_path = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("credinet.db")
        .to_string_lossy()
        .to_string();
    
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| format!("sqlite:{}", default_db_path));
    
    let jwt_secret = env::var("JWT_SECRET")
        .unwrap_or_else(|_| {
            eprintln!("⚠️  警告: 未设置JWT_SECRET环境变量，使用默认值（不安全）");
            "change_this_secret".to_string()
        });

    // 读取服务器配置
    let host = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .unwrap_or(8080);
    
    let bind_addr = format!("{}:{}", host, port);

    eprintln!("📦 连接数据库: {}", database_url);
    let pool = SqlitePool::connect(&database_url).await?;
    
    eprintln!("🔧 初始化数据库...");
    init_database(&pool).await.map_err(|e| anyhow::anyhow!("数据库初始化错误: {}", e))?;
    eprintln!("✅ 数据库初始化完成");

    let state = AppState {
        db: pool,
        jwt_secret,
        rate_limiter: Arc::new(Mutex::new(HashMap::new())),
    };

    let app = Router::new()
        // 兼容原有路由（测试使用）
        .merge(auth::routes::create_auth_routes())
        .merge(did::routes::create_did_routes())
        .merge(identity::routes::create_identity_routes())
        .merge(authorization::routes::create_authorization_routes())
        .merge(credit::routes::create_credit_routes())
        .merge(sbt::routes::create_sbt_routes())
        // 新增 /api 前缀路由
        .nest("/api", api::routes::create_api_routes())
        .with_state(state);

    eprintln!("🚀 正在启动 CrediNet 服务...");
    let listener = TcpListener::bind(&bind_addr).await
        .map_err(|e| anyhow::anyhow!("无法绑定地址 {}: {}", bind_addr, e))?;
    
    eprintln!("");
    eprintln!("✨ CrediNet 去中心化信用网络服务");
    eprintln!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    eprintln!("🌐 服务地址: http://{}", bind_addr);
    eprintln!("📚 API文档:");
    eprintln!("   • 身份认证: docs/AUTH_API_DOCS.md");
    eprintln!("   • DID管理: docs/DID_API_DOCS.md");
    eprintln!("   • 身份验证: docs/IDENTITY_API_DOCS.md");
    eprintln!("   • 用户授权: docs/AUTHORIZATION_API_DOCS.md");
    eprintln!("   • 信用评分: docs/CREDIT_API_DOCS.md");
    eprintln!("   • SBT发放: docs/SBT_API_DOCS.md");
    eprintln!("🧪 测试命令:");
    eprintln!("   ./run_tests.sh all");
    eprintln!("📖 快速开始:");
    eprintln!("   cat docs/QUICK_START.md");
    eprintln!("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    eprintln!("");
    
    axum::serve(listener, app).await?;
    Ok(())
}