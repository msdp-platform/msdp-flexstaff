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

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Table({
  tableName: 'worker_certifications',
  timestamps: true,
})
export class WorkerCertification extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'worker_id',
  })
  workerId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'certification_name',
  })
  certificationName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'issuing_authority',
  })
  issuingAuthority!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'issue_date',
  })
  issueDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'expiry_date',
  })
  expiryDate?: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'document_url',
  })
  documentUrl?: string;

  @Column({
    type: DataType.ENUM(...Object.values(VerificationStatus)),
    allowNull: false,
    defaultValue: VerificationStatus.PENDING,
    field: 'verification_status',
  })
  verificationStatus!: VerificationStatus;

  @BelongsTo(() => User)
  worker!: User;

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
