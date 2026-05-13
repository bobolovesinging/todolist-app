use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};
use std::sync::Mutex;

struct TrayState {
    tray: Mutex<Option<tauri::tray::TrayIcon>>,
    count: Mutex<u32>,
}

#[tauri::command]
fn update_tray_count(count: u32, state: tauri::State<TrayState>) -> Result<(), String> {
    let mut stored = state.count.lock().map_err(|e| e.to_string())?;
    *stored = count;
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

            let show_hide = MenuItemBuilder::with_id("toggle", "Show/Hide")
                .build(app)?;
            let new_todo = MenuItemBuilder::with_id("new", "New Todo")
                .build(app)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let quit = MenuItemBuilder::with_id("quit", "Quit")
                .build(app)?;

            let menu = MenuBuilder::new(app)
                .items(&[&show_hide, &new_todo, &separator, &quit])
                .build()?;

            let app_handle = app.handle().clone();

            let tray = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(move |_app, event| match event.id().as_ref() {
                    "toggle" => toggle_window(&app_handle),
                    "new" => {
                        if let Some(window) = app_handle.get_webview_window("main") {
                            window.show().ok();
                            window.set_focus().ok();
                        }
                        app_handle.emit("tray-new-todo", ()).ok();
                    }
                    "quit" => {
                        app_handle.exit(0);
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
                count: Mutex::new(0),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![update_tray_count])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
