class UserResource {
  constructor(user) {
    this.user = user;
  }

  static format(user) {
    return new UserResource(user).toArray();
  }

  static collection(users) {
    return users.map((user) => new UserResource(user).toArray());
  }

  toArray() {
    return {
      id: this.user._id,
      name: this.user.name,
      email: this.user.email,
    };
  }
}

export default UserResource;
