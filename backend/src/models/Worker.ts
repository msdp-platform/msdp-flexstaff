import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from './User';
import { Application } from './Application';
import { ShiftAssignment } from './ShiftAssignment';
import { Team } from './Team';

@Table({
  tableName: 'workers',
  timestamps: true,
  underscored: true,
})
export class Worker extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    unique: true,
  })
  userId!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  firstName!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  lastName!: string;

  @Column({
    type: DataType.DATEONLY,
  })
  dateOfBirth?: Date;

  @Column({
    type: DataType.STRING(20),
  })
  nationalInsuranceNumber?: string;

  @Column({
    type: DataType.STRING(255),
  })
  addressLine1?: string;

  @Column({
    type: DataType.STRING(255),
  })
  addressLine2?: string;

  @Column({
    type: DataType.STRING(100),
  })
  city?: string;

  @Column({
    type: DataType.STRING(20),
  })
  postcode?: string;

  @Column({
    type: DataType.STRING(2),
    defaultValue: 'GB',
  })
  country!: string;

  @Column({
    type: DataType.TEXT,
  })
  bio?: string;

  @Column({
    type: DataType.STRING(500),
  })
  profilePhotoUrl?: string;

  @Column({
    type: DataType.STRING(500),
  })
  videoProfileUrl?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  hourlyRateMin?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  hourlyRateMax?: number;

  @Column({
    type: DataType.STRING(50),
    defaultValue: 'available',
  })
  availabilityStatus!: string;

  @Column({
    type: DataType.STRING(255),
  })
  stripeAccountId?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  bankVerified!: boolean;

  // Associations
  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => Application)
  applications?: Application[];

  @HasMany(() => ShiftAssignment)
  assignments?: ShiftAssignment[];

  @HasMany(() => Team)
  teams?: Team[];

  // Virtual fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
