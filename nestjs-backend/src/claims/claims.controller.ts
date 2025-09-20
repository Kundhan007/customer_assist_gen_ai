import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimStatusDto } from './dto/update-claim-status.dto';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Controller('claims')
@UseGuards(JwtAuthGuard)
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Get(':id')
  async getClaimById(@Param('id') id: string) {
    const claim = await this.claimsService.getClaimById(id);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    return claim;
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
  async updateClaimStatus(
    @Param('id') id: string,
    @Body() updateClaimStatusDto: UpdateClaimStatusDto,
  ) {
    const result = await this.claimsService.updateClaimStatus(id, updateClaimStatusDto.newStatus);
    if (!result) {
      throw new NotFoundException('Claim not found');
    }
    return result;
  }

  @Delete(':id')
  async deleteClaim(@Param('id') id: string) {
    const result = await this.claimsService.deleteClaim(id);
    if (!result) {
      throw new NotFoundException('Claim not found');
    }
    return result;
  }
}
