import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class AddTorrentDto {
  @IsOptional()
  @IsString()
  magnetUri?: string;

  @IsOptional()
  @IsString()
  torrentFile?: string; // base64 encoded

  @ValidateIf((o) => !o.magnetUri && !o.torrentFile)
  @IsString({ message: 'Either magnetUri or torrentFile must be provided' })
  _validate?: string;
}
