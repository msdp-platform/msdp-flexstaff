import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './User';
import { Shift } from './Shift';

@Table({
  tableName: 'messages',
  timestamps: true,
  underscored: true,
})
export class Message extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  senderId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  receiverId!: string;

  @ForeignKey(() => Shift)
  @Column({
    type: DataType.UUID,
  })
  shiftId?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  messageText!: string;

  @Column({
    type: DataType.DATE,
  })
  readAt?: Date;

  // Associations
  @BelongsTo(() => User, 'senderId')
  sender!: User;

  @BelongsTo(() => User, 'receiverId')
  receiver!: User;

  @BelongsTo(() => Shift)
  shift?: Shift;
}
