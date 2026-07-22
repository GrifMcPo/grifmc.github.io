package com.grifmcpo.register;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import org.bukkit.Bukkit;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.InputStream;

public class RegisterPlugin extends JavaPlugin {

    private static RegisterPlugin instance;
    private DatabaseReference databaseReference;

    @Override
    public void onEnable() {
        instance = this;
        getLogger().info("✅ RegisterPlugin включен!");

        // Инициализируем Firebase
        try {
            // Загружаем файл из resources
            InputStream serviceAccount = getResource("serviceAccountKey.json");
            
            if (serviceAccount == null) {
                getLogger().severe("❌ Файл serviceAccountKey.json не найден в resources!");
                return;
            }

            getLogger().info("✅ serviceAccountKey.json найден!");

            // Проверяем, инициализирован ли уже Firebase
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .setDatabaseUrl("https://ggggg-e8d09-default-rtdb.firebaseio.com")
                        .build();

                FirebaseApp.initializeApp(options);
                getLogger().info("✅ Firebase инициализирована!");
            } else {
                getLogger().info("✅ Firebase уже инициализирована!");
            }

            // Получаем DatabaseReference
            databaseReference = FirebaseDatabase.getInstance().getReference();
            getLogger().info("✅ DatabaseReference получена!");

        } catch (Exception e) {
            getLogger().severe("❌ Ошибка подключения Firebase: " + e.getMessage());
            e.printStackTrace();
            return;
        }

        // Регистрируем слушатели
        Bukkit.getPluginManager().registerEvents(new JoinListener(), this);

        // Запускаем задачу отправки кодов (каждые 5 секунд)
        new CodeSender().runTaskTimer(this, 20L, 100L);

        getLogger().info("✅ RegisterPlugin готов!");
    }

    @Override
    public void onDisable() {
        getLogger().info("❌ RegisterPlugin выключен!");
    }

    public static RegisterPlugin getInstance() {
        return instance;
    }

    public DatabaseReference getDatabaseReference() {
        return databaseReference;
    }
}
