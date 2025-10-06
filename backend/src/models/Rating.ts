import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './User';
import { ShiftAssignment } from './ShiftAssignment';

@Table({
  tableName: 'ratings',
  timestamps: true,
  underscored: true,
})
export class Rating extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => ShiftAssignment)
  @Column({
    type: DataType.UUID,
  })
  assignmentId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  raterId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  ratedId!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  })
  rating!: number;

  @Column({
    type: DataType.TEXT,
  })
  reviewText?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isEmployerRating!: boolean; // true if employer rating worker, false if worker rating employer

  // Associations
  @BelongsTo(() => ShiftAssignment)
  assignment!: ShiftAssignment;

  @BelongsTo(() => User, 'raterId')
  rater!: User;

  @BelongsTo(() => User, 'ratedId')
  rated!: User;
}
