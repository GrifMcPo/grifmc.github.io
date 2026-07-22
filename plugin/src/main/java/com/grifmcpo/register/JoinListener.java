package com.grifmcpo.register;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.ValueEventListener;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;

public class JoinListener implements Listener {

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        String nickname = player.getName();

        DatabaseReference ref = RegisterPlugin.getInstance().getDatabaseReference();

        if (ref == null) {
            player.kickPlayer("§c❌ Ошибка подключения к базе данных!");
            return;
        }

        ref.child("users").orderByChild("nickname").equalTo(nickname)
                .addListenerForSingleValueEvent(new ValueEventListener() {
                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        if (snapshot.exists()) {
                            boolean verified = false;
                            for (DataSnapshot child : snapshot.getChildren()) {
                                Boolean v = child.child("verified").getValue(Boolean.class);
                                if (v != null && v) {
                                    verified = true;
                                    break;
                                }
                            }
                            if (verified) {
                                player.sendMessage("§a✅ Вы успешно зарегистрированы!");
                            } else {
                                player.sendMessage("§c⛔ Вы не подтвердили регистрацию!");
                                player.sendMessage("§7Код отправлен вам в чат при регистрации.");
                            }
                        } else {
                            player.kickPlayer("§cЗарегистрируйся на сайте:\n§ehttps://grifmcpo.github.io");
                        }
                    }

                    @Override
                    public void onCancelled(DatabaseError error) {
                        player.kickPlayer("§c❌ Ошибка базы данных: " + error.getMessage());
                    }
                });
    }
}
