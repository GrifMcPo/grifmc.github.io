package com.grifmcpo.register;

import com.google.firebase.database.*;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.scheduler.BukkitRunnable;

public class CodeSender extends BukkitRunnable {

    @Override
    public void run() {
        DatabaseReference ref = RegisterPlugin.getInstance().getDatabaseReference();
        if (ref == null) return;

        ref.child("users").orderByChild("verified").equalTo(false)
                .addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        for (DataSnapshot child : snapshot.getChildren()) {
                            String nickname = child.child("nickname").getValue(String.class);
                            String code = child.child("code").getValue(String.class);
                            Boolean codeSent = child.child("code_sent").getValue(Boolean.class);

                            if (nickname == null || code == null) continue;
                            if (codeSent != null && codeSent) continue;

                            Player player = Bukkit.getPlayer(nickname);
                            if (player != null) {
                                player.sendMessage("§6🔐 Код подтверждения: §c" + code);
                                player.sendMessage("§7Введите этот код на сайте для завершения регистрации!");
                                child.getRef().child("code_sent").setValue(true);
                                RegisterPlugin.getInstance().getLogger().info("📨 Код отправлен игроку " + nickname);
                            }
                        }
                    }

                    @Override
                    public void onCancelled(DatabaseError error) {
                        RegisterPlugin.getInstance().getLogger().warning("❌ Ошибка отправки кода: " + error.getMessage());
                    }
                });
    }
}
