package com.grifmcpo.register;

import com.google.firebase.database.*;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.scheduler.BukkitRunnable;

public class CodeSender extends BukkitRunnable {

    @Override
    public void run() {
        DatabaseReference ref = RegisterPlugin.getInstance().getDatabaseReference();
        if (ref == null) {
            RegisterPlugin.getInstance().getLogger().warning("❌ DatabaseReference is null!");
            return;
        }

        ref.child("users").orderByChild("verified").equalTo(false)
                .addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        if (!snapshot.exists()) {
                            return;
                        }

                        for (DataSnapshot child : snapshot.getChildren()) {
                            String nickname = child.child("nickname").getValue(String.class);
                            String code = child.child("code").getValue(String.class);
                            Boolean codeSent = child.child("code_sent").getValue(Boolean.class);

                            if (nickname == null || code == null) {
                                continue;
                            }

                            if (codeSent != null && codeSent) {
                                continue;
                            }

                            Player player = Bukkit.getPlayer(nickname);
                            if (player != null && player.isOnline()) {
                                // Отправляем код в чат
                                player.sendMessage("§6═══════════════════════════════");
                                player.sendMessage("§6🔐 Код подтверждения: §c§l" + code);
                                player.sendMessage("§7Введите этот код на сайте для завершения регистрации!");
                                player.sendMessage("§7Сайт: §ehttps://grifmc.github.io");
                                player.sendMessage("§6═══════════════════════════════");

                                // Отмечаем, что код отправлен (используем setValueAsync)
                                child.getRef().child("code_sent").setValueAsync(true);

                                RegisterPlugin.getInstance().getLogger().info("📨 Код " + code + " отправлен игроку " + nickname);
                            } else {
                                RegisterPlugin.getInstance().getLogger().info("⏳ Игрок " + nickname + " офлайн, код не отправлен");
                            }
                        }
                    }

                    @Override
                    public void onCancelled(DatabaseError error) {
                        RegisterPlugin.getInstance().getLogger().warning("❌ Ошибка Firebase: " + error.getMessage());
                    }
                });
    }
}
