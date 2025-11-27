package com.juanmera.tasksync.models;

import com.amigovet.apirest.models.id.UserRoleId;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "user_has_roles")
public class UserHasRoles {

    @EmbeddedId
    private UserRoleId id = new UserRoleId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "id_user")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("roleId")
    @JoinColumn(name = "id_rol")
    private Role role;

    public UserHasRoles() {}

    public UserHasRoles(User user, Role role) {
        this.user = user;
        this.role = role;
        this.id = new UserRoleId(user.getId(), role.getId());
    }
}