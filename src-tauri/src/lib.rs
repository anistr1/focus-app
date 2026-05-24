use serde::Serialize;
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

fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
    let start = MenuItemBuilder::new("Start Focus").id("tray-start").build(app)?;
    let pause = MenuItemBuilder::new("Pause Focus").id("tray-pause").build(app)?;
    let resume = MenuItemBuilder::new("Resume Focus").id("tray-resume").build(app)?;
    let quick_break = MenuItemBuilder::new("Quick Break").id("tray-quick-break").build(app)?;
    let quit = MenuItemBuilder::new("Quit").id("tray-quit").build(app)?;
    let menu = MenuBuilder::new(app)
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
        .on_menu_event(move |app, event| match event.id().as_ref() {
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--autostart"]),
        ))
        .setup(|app| {
            setup_tray(app.handle())?;
            if std::env::args().any(|arg| arg == "--autostart") {
                if let Some(main_window) = app.get_webview_window("main") {
                    let _ = main_window.hide();
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running focus app");
}
