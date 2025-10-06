import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Employer } from './Employer';
import { Worker } from './Worker';

@Table({
  tableName: 'teams',
  timestamps: true,
  underscored: true,
})
export class Team extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => Employer)
  @Column({
    type: DataType.UUID,
  })
  employerId!: string;

  @ForeignKey(() => Worker)
  @Column({
    type: DataType.UUID,
  })
  workerId!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  autoAccept!: boolean;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  addedAt!: Date;

  // Associations
  @BelongsTo(() => Employer)
  employer!: Employer;

  @BelongsTo(() => Worker)
  worker!: Worker;
}
