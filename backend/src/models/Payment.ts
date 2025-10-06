import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Timesheet } from './Timesheet';
import { Worker } from './Worker';
import { Employer } from './Employer';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Table({
  tableName: 'payments',
  timestamps: true,
  underscored: true,
})
export class Payment extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Timesheet)
  @Column({
    type: DataType.UUID,
  })
  timesheetId?: string;

  @ForeignKey(() => Worker)
  @Column({
    type: DataType.UUID,
  })
  workerId!: string;

  @ForeignKey(() => Employer)
  @Column({
    type: DataType.UUID,
  })
  employerId!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  platformFee?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
  })
  netAmount?: number;

  @Column({
    type: DataType.STRING(255),
  })
  stripePaymentIntentId?: string;

  @Column({
    type: DataType.STRING(255),
  })
  stripeTransferId?: string;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    defaultValue: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({
    type: DataType.STRING(50),
  })
  paymentMethod?: string;

  @Column({
    type: DataType.DATE,
  })
  paidAt?: Date;

  // Associations
  @BelongsTo(() => Timesheet)
  timesheet?: Timesheet;

  @BelongsTo(() => Worker)
  worker!: Worker;

  @BelongsTo(() => Employer)
  employer!: Employer;
}
