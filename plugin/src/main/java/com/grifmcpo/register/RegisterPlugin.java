package com.grifmcpo.register;

import com.google.firebase.FirebaseApp;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import org.bukkit.Bukkit;
import org.bukkit.plugin.java.JavaPlugin;
import java.io.InputStream;

public class RegisterPlugin extends JavaPlugin {

    private static RegisterPlugin instance;
    private FirebaseDatabase firebaseDatabase;
    private DatabaseReference databaseReference;

    @Override
    public void onEnable() {
        instance = this;
        getLogger().info("✅ RegisterPlugin включен!");

        // Подключаем Firebase
        try {
            InputStream serviceAccount = getResource("serviceAccountKey.json");
            if (serviceAccount == null) {
                getLogger().severe("❌ Файл serviceAccountKey.json не найден в ресурсах!");
                getLogger().severe("❌ Положите его в plugins/RegisterPlugin/");
                return;
            }
            firebaseDatabase = FirebaseDatabase.getInstance();
            databaseReference = firebaseDatabase.getReference();
            getLogger().info("✅ Firebase подключена!");
        } catch (Exception e) {
            getLogger().severe("❌ Ошибка подключения Firebase: " + e.getMessage());
        }

        // Регистрируем слушатели
        Bukkit.getPluginManager().registerEvents(new JoinListener(), this);
        new CodeSender().runTaskTimer(this, 20L, 100L); // каждые 5 секунд

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
