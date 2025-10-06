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
import { Worker } from './Worker';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

@Table({
  tableName: 'portfolio_items',
  timestamps: true,
})
export class PortfolioItem extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Worker)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'worker_id',
  })
  workerId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'media_type',
  })
  mediaType!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'media_url',
  })
  mediaUrl!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'thumbnail_url',
  })
  thumbnailUrl?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'display_order',
  })
  displayOrder!: number;

  @BelongsTo(() => Worker)
  worker!: Worker;

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
