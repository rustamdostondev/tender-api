import ObjectID from 'bson-objectid';

export const objectId = () => new ObjectID().toString();

export const getBucketName = (): string => {
  const TodayDate = new Date();
  const currentYear = TodayDate.getFullYear();
  const currentMonth = TodayDate.getMonth() + 1;
  return `${currentYear}-${currentMonth}`.toString();
};
