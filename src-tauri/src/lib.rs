use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, CheckMenuItemBuilder, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, LogicalPosition, LogicalSize,
};
use tauri_plugin_autostart::ManagerExt as AutostartManagerExt;
use std::sync::Mutex;

struct TrayState {
    tray: Mutex<Option<tauri::tray::TrayIcon>>,
}

fn toggle_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(true) {
            window.hide().ok();
        } else {
            window.show().ok();
            window.set_focus().ok();
        }
    }
}

fn build_tray_menu(
    app: &tauri::AppHandle,
    autostart_enabled: bool,
) -> Result<tauri::menu::Menu<tauri::Wry>, tauri::Error> {
    let toggle = MenuItemBuilder::with_id("toggle", "Show/Hide").build(app)?;
    let new_todo = MenuItemBuilder::with_id("new", "New Todo").build(app)?;
    let sep1 = PredefinedMenuItem::separator(app)?;
    let autostart = CheckMenuItemBuilder::with_id("autostart", "Launch on Startup")
        .checked(autostart_enabled)
        .build(app)?;
    let sep2 = PredefinedMenuItem::separator(app)?;
    let quit = MenuItemBuilder::with_id("quit", "Exit").build(app)?;

    MenuBuilder::new(app)
        .items(&[&toggle, &new_todo, &sep1, &autostart, &sep2, &quit])
        .build()
}

fn toggle_autostart(app: &tauri::AppHandle) {
    let enabled = app.autolaunch().is_enabled().unwrap_or(false);
    if enabled {
        app.autolaunch().disable().ok();
    } else {
        app.autolaunch().enable().ok();
    }
    let new_enabled = !enabled;
    if let Ok(new_menu) = build_tray_menu(app, new_enabled) {
        let state = app.state::<TrayState>();
        let tray_lock = state.tray.lock().unwrap();
        if let Some(ref tray) = *tray_lock {
            tray.set_menu(Some(new_menu)).ok();
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // --- Sidebar window setup ---
            let window = app.get_webview_window("main").unwrap();
            window.set_decorations(false).ok();
            window.set_always_on_top(true).ok();
            window.set_skip_taskbar(true).ok();
            window.set_resizable(false).ok();
            window.set_shadow(false).ok();

            if let Some(monitor) = window.primary_monitor().ok().flatten() {
                let scale = monitor.scale_factor();
                let size = monitor.size();
                let screen_w = size.width as f64 / scale;
                let screen_h = size.height as f64 / scale;
                let sidebar_w = 400.0;
                let tab_visible = 12.0;
                window.set_size(LogicalSize::new(sidebar_w, screen_h)).ok();
                // Start hidden — only the top-right tab is visible
                window.set_position(LogicalPosition::new(screen_w - tab_visible, 0.0)).ok();
            }

            window.show().ok();
            window.set_focus().ok();

            let app_handle = app.handle().clone();
            let autostart_enabled = app_handle.autolaunch().is_enabled().unwrap_or(false);
            let menu = build_tray_menu(&app_handle, autostart_enabled)?;

            let tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().cloned().unwrap())
                .menu(&menu)
                .on_menu_event(move |app, event| match event.id().as_ref() {
                    "toggle" => toggle_window(app),
                    "new" => {
                        if let Some(window) = app.get_webview_window("main") {
                            window.show().ok();
                            window.set_focus().ok();
                        }
                        app.emit("tray-new-todo", ()).ok();
                    }
                    "autostart" => toggle_autostart(app),
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        toggle_window(app);
                    }
                })
                .build(app)?;

            app.manage(TrayState {
                tray: Mutex::new(Some(tray)),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![update_tray_count])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn update_tray_count(count: u32, state: tauri::State<TrayState>) -> Result<(), String> {
    let tray = state.tray.lock().map_err(|e| e.to_string())?;
    if let Some(ref tray) = *tray {
        if count > 0 {
            tray.set_title(Some(count.to_string())).ok();
        } else {
            tray.set_title(None::<&str>).ok();
        }
    }
    Ok(())
}
