import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimStatusDto } from './dto/update-claim-status.dto';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Get(':id')
  getClaimById(@Param('id') id: string) {
    return this.claimsService.getClaimById(id);
  }

  @Post()
  createClaim(@Body() createClaimDto: CreateClaimDto) {
    return this.claimsService.createClaim(
      createClaimDto.policyId,
      createClaimDto.description,
      createClaimDto.vehicle,
      createClaimDto.photos,
    );
  }

  @Get()
  getClaimsByPolicy(@Query('policyId') policyId?: string) {
    if (policyId) {
      return this.claimsService.getClaimsByPolicy(policyId);
    }
    return this.claimsService.getAllClaims();
  }

  @Patch(':id/status')
  updateClaimStatus(
    @Param('id') id: string,
    @Body() updateClaimStatusDto: UpdateClaimStatusDto,
  ) {
    return this.claimsService.updateClaimStatus(id, updateClaimStatusDto.newStatus);
  }

  @Delete(':id')
  deleteClaim(@Param('id') id: string) {
    return this.claimsService.deleteClaim(id);
  }
}
