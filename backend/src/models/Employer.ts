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
import { Shift } from './Shift';
import { Team } from './Team';

export enum IndustryType {
  HOSPITALITY = 'hospitality',
  RETAIL = 'retail',
  HEALTHCARE = 'healthcare',
  EVENTS = 'events',
  LOGISTICS = 'logistics',
  CONSTRUCTION = 'construction',
  OFFICE = 'office',
  OTHER = 'other',
}

@Table({
  tableName: 'employers',
  timestamps: true,
  underscored: true,
})
export class Employer extends Model {
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
    type: DataType.STRING(255),
    allowNull: false,
  })
  companyName!: string;

  @Column({
    type: DataType.STRING(50),
  })
  companyNumber?: string;

  @Column({
    type: DataType.STRING(50),
  })
  vatNumber?: string;

  @Column({
    type: DataType.ENUM(...Object.values(IndustryType)),
    allowNull: false,
  })
  industry!: IndustryType;

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
    type: DataType.STRING(255),
  })
  website?: string;

  @Column({
    type: DataType.TEXT,
  })
  description?: string;

  @Column({
    type: DataType.STRING(500),
  })
  logoUrl?: string;

  @Column({
    type: DataType.STRING(255),
  })
  stripeAccountId?: string;

  @Column({
    type: DataType.STRING(50),
    defaultValue: 'classic',
  })
  subscriptionTier!: string;

  // Associations
  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => Shift)
  shifts?: Shift[];

  @HasMany(() => Team)
  teams?: Team[];
}
