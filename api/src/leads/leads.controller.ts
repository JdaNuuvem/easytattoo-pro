import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Leads')
@Controller('leads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all leads for current artist' })
  async getLeads(@CurrentUser('id') userId: string) {
    return this.leadsService.getLeads(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lead statistics' })
  async getLeadStats(@CurrentUser('id') userId: string) {
    return this.leadsService.getLeadStats(userId);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export leads as CSV' })
  async exportCsv(
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const csv = await this.leadsService.exportCsv(userId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=leads-${new Date().toISOString().split('T')[0]}.csv`,
    );
    res.send(csv);
  }

  @Get('export/lookalike')
  @ApiOperation({ summary: 'Export leads for lookalike audience' })
  async exportLookalike(
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const csv = await this.leadsService.exportLookalike(userId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=lookalike-${new Date().toISOString().split('T')[0]}.csv`,
    );
    res.send(csv);
  }
}
