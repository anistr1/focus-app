use serde::Serialize;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::panic;
use std::path::PathBuf;
use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Emitter, Manager};

#[derive(Clone, Serialize)]
struct TrayActionPayload {
    action: String,
}

fn emit_tray_action(app: &AppHandle, action: &str) {
    let _ = app.emit(
        "tray-action",
        TrayActionPayload {
            action: action.to_string(),
        },
    );
}

fn startup_log_path() -> PathBuf {
    let mut base = std::env::var_os("LOCALAPPDATA")
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("APPDATA").map(PathBuf::from))
        .unwrap_or_else(std::env::temp_dir);
    base.push("Focus App");
    base.push("logs");
    base.push("startup.log");
    base
}

fn log_startup(message: &str) {
    let path = startup_log_path();
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }

    if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) {
        let _ = writeln!(file, "{message}");
    }
}

fn init_startup_logging() {
    panic::set_hook(Box::new(|panic_info| {
        log_startup(&format!("panic: {panic_info}"));
    }));
    log_startup("boot: startup logging initialized");
}

fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
    let open = MenuItemBuilder::new("Open Focus App")
        .id("tray-open")
        .build(app)?;
    let start = MenuItemBuilder::new("Start Focus").id("tray-start").build(app)?;
    let pause = MenuItemBuilder::new("Pause Focus").id("tray-pause").build(app)?;
    let resume = MenuItemBuilder::new("Resume Focus").id("tray-resume").build(app)?;
    let quick_break = MenuItemBuilder::new("Quick Break").id("tray-quick-break").build(app)?;
    let quit = MenuItemBuilder::new("Quit").id("tray-quit").build(app)?;
    let menu = MenuBuilder::new(app)
        .item(&open)
        .separator()
        .item(&start)
        .item(&pause)
        .item(&resume)
        .item(&quick_break)
        .separator()
        .item(&quit)
        .build()?;

    let app_handle = app.clone();
    let tray_icon = app.default_window_icon().cloned();
    
    let mut builder = TrayIconBuilder::new()
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_tray_icon_event(move |_tray, event| {
            if let tauri::tray::TrayIconEvent::Click { .. } = event {
                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "tray-open" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "tray-start" => emit_tray_action(app, "start"),
            "tray-pause" => emit_tray_action(app, "pause"),
            "tray-resume" => emit_tray_action(app, "resume"),
            "tray-quick-break" => emit_tray_action(app, "quick-break"),
            "tray-quit" => app.exit(0),
            _ => {}
        });

    if let Some(icon) = tray_icon {
        builder = builder.icon(icon);
    }

    builder.build(app)?;

    Ok(())
}

#[tauri::command]
fn exit_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    init_startup_logging();
    log_startup("boot: entering tauri run");

    let app_result = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![exit_app])
        // Temporary test mode: disable failing plugins to verify base app startup.
        // .plugin(tauri_plugin_notification::init())
        // .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--autostart"]),
        ))
        .setup(|app| {
            log_startup("setup: start");
            if let Err(error) = setup_tray(app.handle()) {
                log_startup(&format!("setup: tray init failed: {error}"));
                eprintln!("Failed to initialize tray icon: {error}");
            } else {
                log_startup("setup: tray initialized");
            }
            if std::env::args().any(|arg| arg == "--autostart") {
                log_startup("setup: autostart argument detected");
                if let Some(main_window) = app.get_webview_window("main") {
                    let _ = main_window.hide();
                    log_startup("setup: main window hidden for autostart");
                }
            }
            log_startup("setup: complete");
            Ok(())
        })
        .run(tauri::generate_context!());

    if let Err(error) = app_result {
        log_startup(&format!("fatal: tauri run failed: {error}"));
        eprintln!("Fatal Tauri run error: {error}");
    }
}
