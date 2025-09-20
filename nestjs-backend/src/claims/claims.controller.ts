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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('claims')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Get(':id')
  @Roles('user', 'admin')
  async getClaimById(@Param('id') id: string) {
    const claim = await this.claimsService.getClaimById(id);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    return claim;
  }

  @Post()
  @Roles('user', 'admin')
  createClaim(@Body() createClaimDto: CreateClaimDto) {
    return this.claimsService.createClaim(
      createClaimDto.policyId,
      createClaimDto.description,
      createClaimDto.vehicle,
      createClaimDto.photos,
    );
  }

  @Get()
  @Roles('user', 'admin')
  getClaimsByPolicy(@Query('policyId') policyId?: string) {
    if (policyId) {
      return this.claimsService.getClaimsByPolicy(policyId);
    }
    return this.claimsService.getAllClaims();
  }

  @Patch(':id/status')
  @Roles('admin')
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
  @Roles('admin')
  async deleteClaim(@Param('id') id: string) {
    const result = await this.claimsService.deleteClaim(id);
    if (!result) {
      throw new NotFoundException('Claim not found');
    }
    return result;
  }
}
