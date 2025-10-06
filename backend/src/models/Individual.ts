import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'individuals',
  timestamps: true,
})
export class Individual extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id',
  })
  userId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'first_name',
  })
  firstName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'last_name',
  })
  lastName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'phone_number',
  })
  phoneNumber?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'address_line1',
  })
  addressLine1?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'address_line2',
  })
  addressLine2?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  city?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  postcode?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'GB',
  })
  country?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  preferences?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'stripe_customer_id',
  })
  stripeCustomerId?: string;

  @BelongsTo(() => User)
  user!: User;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  updatedAt!: Date;
}
