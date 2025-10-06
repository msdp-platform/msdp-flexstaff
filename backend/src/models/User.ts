import {
  Table,
  Column,
  Model,
  DataType,
  HasOne,
  HasMany,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';
import { Employer } from './Employer';
import { Worker } from './Worker';
import { Individual } from './Individual';
import { Message } from './Message';
import { Notification } from './Notification';

export enum UserRole {
  EMPLOYER = 'employer',
  WORKER = 'worker',
  ADMIN = 'admin',
  INDIVIDUAL = 'individual',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  email!: string;

  @Column({
    type: DataType.STRING(20),
    unique: true,
  })
  phone?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'password_hash',
  })
  passwordHash!: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
  })
  role!: UserRole;

  @Column({
    type: DataType.ENUM(...Object.values(UserStatus)),
    defaultValue: UserStatus.PENDING_VERIFICATION,
  })
  status!: UserStatus;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'email_verified',
  })
  emailVerified!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'phone_verified',
  })
  phoneVerified!: boolean;

  @Column({
    type: DataType.DATE,
    field: 'last_login',
  })
  lastLogin?: Date;

  // Associations
  @HasOne(() => Employer)
  employer?: Employer;

  @HasOne(() => Worker)
  worker?: Worker;

  @HasOne(() => Individual)
  individual?: Individual;

  @HasMany(() => Message, 'senderId')
  sentMessages?: Message[];

  @HasMany(() => Message, 'receiverId')
  receivedMessages?: Message[];

  @HasMany(() => Notification)
  notifications?: Notification[];

  // Methods
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.passwordHash);
  }

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('passwordHash')) {
      const salt = await bcrypt.genSalt(10);
      instance.passwordHash = await bcrypt.hash(instance.passwordHash, salt);
    }
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.passwordHash;
    return values;
  }
}
