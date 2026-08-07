using System;
using System.Collections.Generic;
using CASE_STUDY_7.Models;
using Microsoft.EntityFrameworkCore;

namespace CASE_STUDY_7.DataAccess;

public partial class Vantage7Context : DbContext
{
    public Vantage7Context()
    {
    }

    public Vantage7Context(DbContextOptions<Vantage7Context> options)
        : base(options)
    {
    }

    public virtual DbSet<EodPrice> EodPrices { get; set; }

    public virtual DbSet<Security> Securities { get; set; }

    public virtual DbSet<Trade> Trades { get; set; }

    public virtual DbSet<Trader> Traders { get; set; }

    public virtual DbSet<VwTradeBlotter> VwTradeBlotters { get; set; }

    

        

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<EodPrice>(entity =>
        {
            entity.HasKey(e => e.PriceId);

            entity.ToTable("EOD_Prices", "g7");

            entity.HasIndex(e => new { e.SecurityId, e.PriceDate }, "UQ_EODPrices_Security_Date").IsUnique();

            entity.Property(e => e.PriceId).HasColumnName("PriceID");
            entity.Property(e => e.ClosePrice).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.SecurityId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("SecurityID");

            entity.HasOne(d => d.Security).WithMany(p => p.EodPrices)
                .HasForeignKey(d => d.SecurityId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_EODPrices_Securities");
        });

        modelBuilder.Entity<Security>(entity =>
        {
            entity.ToTable("Securities", "g7");

            entity.Property(e => e.SecurityId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("SecurityID");
            entity.Property(e => e.AssetClass)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.CouponRatePct).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.FaceValue).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.SecurityName).HasMaxLength(150);
            entity.Property(e => e.StartPrice).HasColumnType("decimal(18, 4)");
        });

        modelBuilder.Entity<Trade>(entity =>
        {
            entity.ToTable("Trades", "g7");

            entity.HasIndex(e => new { e.SecurityId, e.TradeDate, e.TradeId }, "IX_Trades_Security_TradeDate");

            entity.HasIndex(e => new { e.TradeDate, e.SecurityId, e.TradeId }, "IX_Trades_TradeDate_Security");

            entity.Property(e => e.TradeId).HasColumnName("TradeID");
            entity.Property(e => e.BuySell)
                .HasMaxLength(4)
                .IsUnicode(false);
            entity.Property(e => e.Price).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.SecurityId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("SecurityID");
            entity.Property(e => e.TraderId).HasColumnName("TraderID");

            entity.HasOne(d => d.Security).WithMany(p => p.Trades)
                .HasForeignKey(d => d.SecurityId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Trades_Securities");

            entity.HasOne(d => d.Trader).WithMany(p => p.Trades)
                .HasForeignKey(d => d.TraderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Trades_Traders");
        });

        modelBuilder.Entity<Trader>(entity =>
        {
            entity.ToTable("Traders", "G7");

            entity.Property(e => e.TraderId)
                .ValueGeneratedNever()
                .HasColumnName("TraderID");
            entity.Property(e => e.Desk)
                .HasMaxLength(100)
                .HasDefaultValue("Equities & Fixed Income Desk");
            entity.Property(e => e.TraderName).HasMaxLength(100);
        });

        modelBuilder.Entity<VwTradeBlotter>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_TradeBlotter", "G7");

            entity.Property(e => e.BuySell)
                .HasMaxLength(4)
                .IsUnicode(false);
            entity.Property(e => e.GrossNotionalAmount).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.Price).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.SecurityId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("SecurityID");
            entity.Property(e => e.SecurityName).HasMaxLength(150);
            entity.Property(e => e.TradeId).HasColumnName("TradeID");
            entity.Property(e => e.TraderId).HasColumnName("TraderID");
            entity.Property(e => e.TraderName).HasMaxLength(100);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
